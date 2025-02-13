import { useState } from "react";
import { Question } from "../../types/event";
import { ThumbsUp, MessageSquare, User } from "lucide-react";
import { QuestionForm } from "./QuestionForm";
import {
  Box,
  Button,
  Text,
  HStack,
  VStack,
  Icon,
  Flex,
  keyframes,
} from "@chakra-ui/react";
import { useTranslation } from 'react-i18next';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface QuestionCardProps {
  question: Question;
  onLike: (id: string) => void;
  onFollowUp: (parentId: string, content: string, nickname: string | undefined, isAnonymous: boolean) => void;
  onLoadFollowUps: (questionId: string) => void;
  followUps?: Question[];
}

export const QuestionCard = ({ question, onLike, onFollowUp, onLoadFollowUps, followUps = [] }: QuestionCardProps) => {
  const { t } = useTranslation();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const animation = `${fadeUp} 0.3s ease-out`;

  const handleReplyClick = () => {
    setShowReplyForm(!showReplyForm);
    if (!showReplyForm) {
      onLoadFollowUps(question.id);
    }
  };

  return (
    <Box p={4} bg="background" borderWidth="1px" rounded="lg" shadow="sm" animation={animation}>
      <VStack align="stretch" spacing={4}>
        <QuestionContent question={question} />
        <QuestionActions
          question={question}
          onLike={onLike}
          handleReplyClick={handleReplyClick}
          t={t}
        />
        {showReplyForm && (
          <ReplyForm
            questionId={question.id}
            onFollowUp={onFollowUp}
            onSubmit={() => setShowReplyForm(false)}
          />
        )}
        {followUps.length > 0 && <FollowUpList followUps={followUps} />}
      </VStack>
    </Box>
  );
};

const QuestionContent = ({ question }: { question: Question }) => (
  <Flex justifyContent="space-between" alignItems="flex-start">
    <VStack align="stretch" spacing={2}>
      <HStack spacing={1} color="gray.500" fontSize="sm">
        <Icon as={User} boxSize={4} />
        {question.userName && <Text as="span">{question.userName}</Text>}
      </HStack>
      <Text fontSize="base">{question.content}</Text>
    </VStack>
  </Flex>
);

interface QuestionActionsProps {
  question: Question;
  onLike: (id: string) => void;
  handleReplyClick: () => void;
  t: (key: string) => string;
}

const QuestionActions = ({ question, onLike, handleReplyClick, t }: QuestionActionsProps) => (
  <HStack spacing={4}>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onLike(question.id)}
      _hover={{ bg: "primary.50" }}
    >
      <HStack spacing={2}>
        <Icon
          as={ThumbsUp}
          color={question.likes > 0 ? "primary.500" : "inherit"}
        />
        <Text>{question.likes || question.like_count || 0}</Text>
      </HStack>
    </Button>

    <Button variant="ghost" size="sm" onClick={handleReplyClick}>
      <HStack spacing={2}>
        <Icon as={MessageSquare} />
        <Text>{t('event.question.followUp')}</Text>
      </HStack>
    </Button>
  </HStack>
);

interface ReplyFormProps {
  questionId: string;
  onFollowUp: (parentId: string, content: string, nickname: string | undefined, isAnonymous: boolean) => void;
  onSubmit: () => void;
}

const ReplyForm = ({ questionId, onFollowUp, onSubmit }: ReplyFormProps) => (
  <Box pl={4} borderLeftWidth="2px" borderColor="primary.200">
    <QuestionForm
      onSubmit={(content, nickname, isAnonymous) => {
        onFollowUp(questionId, content, nickname, isAnonymous);
        onSubmit();
      }}
      parentId={questionId}
    />
  </Box>
);

const FollowUpList = ({ followUps }: { followUps: Question[] }) => (
  <Box pl={4} borderLeftWidth="2px" borderColor="primary.200">
    <VStack spacing={4} align="stretch">
      {followUps.map((followUp) => (
        <Box key={followUp.id} p={3} bg="gray.50" rounded="lg">
          <HStack spacing={1} color="gray.500" fontSize="sm" mb={1}>
            <Icon as={User} boxSize={4} />
            {followUp.userName && <Text as="span">{followUp.userName}</Text>}
          </HStack>
          <Text fontSize="sm">{followUp.content}</Text>
        </Box>
      ))}
    </VStack>
  </Box>
);
