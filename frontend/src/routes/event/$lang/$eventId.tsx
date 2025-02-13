import { useState, useEffect, useCallback } from "react";
import { Question, EventDetails } from "../../../types/event";
import { QuestionForm } from "../../../components/Question/QuestionForm";
import { QuestionCard } from "../../../components/Question/QuestionCard";
import { createFileRoute } from "@tanstack/react-router";
import {
  Container,
  Heading,
  Box,
  VStack,
  keyframes,
  useToast,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { QuestionsService, EventsService } from "../../../client/sdk.gen";
import { useTranslation } from 'react-i18next';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const useEventData = (eventId: string) => {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [mainQuestions, setMainQuestions] = useState<Question[]>([]);
  const [followupQuestions, setFollowupQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchEventAndQuestions = async () => {
      try {
        setIsLoading(true);
        const [eventResponse, questionsResponse] = await Promise.all([
          EventsService.getEvent({ id: eventId }),
          QuestionsService.listQuestions({
            eventId: eventId,
            sortBy: "created_at",
            order: "desc",
          })
        ]);

        setEvent(eventResponse as unknown as EventDetails);
        setMainQuestions((questionsResponse.data as any[]).map(q => ({
          ...q,
          userName: q.user_name,
          likes: q.like_count || 0,
        })));
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error fetching data",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEventAndQuestions();
    }
  }, [eventId, toast]);

  return { event, mainQuestions, setMainQuestions, followupQuestions, setFollowupQuestions, isLoading };
};

const useWebSocket = (eventId: string, onMessage: (message: any) => void) => {
  useEffect(() => {
    if (!eventId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/v1/ws/events/${eventId}`;

    const ws = new WebSocket(wsUrl);
    let heartbeatInterval: NodeJS.Timeout;

    ws.onopen = () => {
      heartbeatInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send('ping');
        }
      }, 30000);
    };

    ws.onmessage = (event) => {
      if (event.data === 'pong') return;
      try {
        const message = JSON.parse(event.data);
        onMessage(message);
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    return () => {
      clearInterval(heartbeatInterval);
      ws.close(1000, 'Component unmounting');
    };
  }, [eventId, onMessage]);
};

export const Route = createFileRoute('/event/$lang/$eventId')({
  component: Events,
  parseParams: (params) => {
    return {
      lang: params.lang,
      eventId: params.eventId
    }
  }
});

function Events() {
  const { t, i18n } = useTranslation();
  const { eventId, lang } = Route.useParams();
  const toast = useToast();
  const animation = `${fadeIn} 0.5s ease-in`;

  useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  const {
    event,
    mainQuestions,
    setMainQuestions,
    followupQuestions,
    setFollowupQuestions,
    isLoading
  } = useEventData(eventId);

  const handleWebSocketMessage = useCallback((message: any) => {
    const processedQuestion = {
      ...message.data,
      userName: message.data.user_name,
      likes: message.data.like_count || 0,
      followup_count: message.data.followup_count || 0,
      parentId: message.data.parent_id
    };

    switch (message.type) {
      case 'new_question':
        if (processedQuestion.parentId) {
          setFollowupQuestions(prev => [processedQuestion, ...prev]);
          setMainQuestions(prev =>
            prev.map(q =>
              q.id === processedQuestion.parentId
                ? { ...q, followup_count: message.parent_update?.followup_count || q.followup_count }
                : q
            )
          );
        } else {
          setMainQuestions(prev => [processedQuestion, ...prev]);
        }
        break;

      case 'question_updated':
      case 'question_liked':
        setMainQuestions(prev =>
          prev.map(q =>
            q.id === processedQuestion.id
              ? { ...q, ...processedQuestion }
              : q
          )
        );
        break;
    }
  }, [setMainQuestions, setFollowupQuestions]);

  useWebSocket(eventId, handleWebSocketMessage);

  const handleQuestionSubmit = async (content: string, nickname: string | undefined, isAnonymous: boolean) => {
    try {
      await QuestionsService.createQuestion({
        eventId: eventId,
        userName: nickname || '',
        attendeeIdentifier: isAnonymous ? '' : (nickname || ''),
        requestBody: { content },
      });
      toast({
        title: t('event.question.submitSuccess'),
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error submitting question:", error);
      toast({
        title: t('event.question.submitError'),
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleLike = async (questionId: string) => {
    try {
      await QuestionsService.likeQuestion({
        eventId: eventId,
        id: questionId,
      });
    } catch (error) {
      console.error("Error liking question:", error);
      toast({
        title: "Error liking question",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleFollowUp = async (parentId: string, content: string, nickname: string | undefined, isAnonymous: boolean) => {
    try {
      await QuestionsService.createQuestion({
        eventId: eventId,
        userName: nickname || '',
        attendeeIdentifier: isAnonymous ? '' : (nickname || ''),
        requestBody: { content },
        parentId: parentId,
      });
      toast({
        title: "Follow-up submitted successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error submitting follow-up:", error);
      toast({
        title: "Error submitting follow-up",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleLoadFollowUps = async (questionId: string) => {
    const question = mainQuestions.find(q => q.id === questionId);
    if (!question) return;

    const loadedFollowUps = followupQuestions.filter(q => q.parentId === questionId).length;
    if (loadedFollowUps >= question.followup_count) return;

    try {
      const response = await QuestionsService.listQuestions({
        eventId: eventId,
        parentId: questionId,
        sortBy: "created_at",
        order: "desc",
      });

      setFollowupQuestions(prev => [...prev,
        ...(response.data as any[]).map(q => ({
          ...q,
          userName: q.user_name,
          parentId: questionId
        }))
      ]);
    } catch (error) {
      console.error("Error loading follow-ups:", error);
      toast({
        title: "Error loading follow-up questions",
        status: "error",
        duration: 3000,
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxW="4xl" px={4} py={8}>
      <Heading as="h1" size="lg" mb={8} animation={animation}>
        {event?.name || t('event.title')}
      </Heading>

      <Box mb={8}>
        <QuestionForm onSubmit={handleQuestionSubmit} />
      </Box>

      <VStack spacing={6} align="stretch">
        {mainQuestions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            onLike={handleLike}
            onFollowUp={handleFollowUp}
            onLoadFollowUps={handleLoadFollowUps}
            followUps={followupQuestions.filter((f) => f.parentId === question.id)}
          />
        ))}
      </VStack>
    </Container>
  );
}

const LoadingSpinner = () => (
  <Flex justify="center" align="center" h="200px">
    <Spinner />
  </Flex>
);
