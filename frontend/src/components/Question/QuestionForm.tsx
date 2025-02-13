import { useState, useCallback } from "react";
import {
  Box,
  Button,
  Textarea,
  VStack,
  HStack,
  Input,
  Switch,
  FormLabel,
  FormControl,
  useColorModeValue,
  Stack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useTranslation } from 'react-i18next';

interface QuestionFormProps {
  onSubmit: (content: string, nickname: string | undefined, isAnonymous: boolean) => void;
  parentId?: string;
}

const useQuestionForm = (parentId?: string) => {
  const storageKey = parentId ? `nickname-${parentId}` : 'nickname';
  const anonymousKey = parentId ? `anonymous-${parentId}` : 'anonymous';

  const [content, setContent] = useState("");
  const [nickname, setNickname] = useState(() => localStorage.getItem(storageKey) || "");
  const [isAnonymous, setIsAnonymous] = useState(() => localStorage.getItem(anonymousKey) === 'true');

  return {
    content,
    setContent,
    nickname,
    setNickname,
    isAnonymous,
    setIsAnonymous,
    storageKey,
    anonymousKey,
  };
};

export const QuestionForm = ({ onSubmit, parentId }: QuestionFormProps) => {
  const { t } = useTranslation();
  const {
    content,
    setContent,
    nickname,
    setNickname,
    isAnonymous,
    setIsAnonymous,
    storageKey,
    anonymousKey,
  } = useQuestionForm(parentId);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!isAnonymous) {
      localStorage.setItem(storageKey, nickname);
    }
    localStorage.setItem(anonymousKey, isAnonymous.toString());

    onSubmit(content.trim(), isAnonymous ? undefined : nickname, isAnonymous);
    setContent("");
  }, [content, nickname, isAnonymous, onSubmit, storageKey, anonymousKey]);

  const bgColor = useColorModeValue("white", "gray.700");
  const isVerticalLayout = useBreakpointValue({ base: true, md: false }) ?? true;

  const formId = `question-${parentId || 'main'}`;
  const anonymousId = `anonymous-${parentId || 'main'}`;

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      p={4}
      bg="blackAlpha.50"
      rounded="lg"
      animation="fadeIn 0.3s ease-in"
      borderWidth="1px"
      borderColor="gray.200"
      _dark={{
        bg: "whiteAlpha.50",
        borderColor: "gray.600"
      }}
    >
      <VStack spacing={4}>
        <QuestionInput
          id={formId}
          content={content}
          setContent={setContent}
          parentId={parentId}
          bgColor={bgColor}
          t={t}
        />

        <FormControls
          nickname={nickname}
          setNickname={setNickname}
          isAnonymous={isAnonymous}
          setIsAnonymous={setIsAnonymous}
          isVerticalLayout={isVerticalLayout}
          bgColor={bgColor}
          anonymousId={anonymousId}
          content={content}
          parentId={parentId}
          t={t}
        />
      </VStack>
    </Box>
  );
};

interface QuestionInputProps {
  id: string;
  content: string;
  setContent: (content: string) => void;
  parentId?: string;
  bgColor: string;
  t: (key: string) => string;
}

const QuestionInput = ({ id, content, setContent, parentId, bgColor, t }: QuestionInputProps) => (
  <FormControl>
    <FormLabel htmlFor={id}>
      {parentId ? t('event.question.yourFollowUp') : t('event.question.yourQuestion')}
    </FormLabel>
    <Textarea
      id={id}
      value={content}
      onChange={(e) => setContent(e.target.value)}
      placeholder={parentId ? t('event.question.followUpPlaceholder') : t('event.question.placeholder')}
      minH="100px"
      bg={bgColor}
      _dark={{ bg: "gray.700" }}
    />
  </FormControl>
);

interface FormControlsProps {
  nickname: string;
  setNickname: (nickname: string) => void;
  isAnonymous: boolean;
  setIsAnonymous: (isAnonymous: boolean) => void;
  isVerticalLayout: boolean;
  bgColor: string;
  anonymousId: string;
  content: string;
  parentId?: string;
  t: (key: string) => string;
}

const FormControls = ({
  nickname,
  setNickname,
  isAnonymous,
  setIsAnonymous,
  isVerticalLayout,
  bgColor,
  anonymousId,
  content,
  parentId,
  t,
}: FormControlsProps) => (
  <Stack
    direction={isVerticalLayout ? "column" : "row"}
    spacing={4}
    width="full"
    align={isVerticalLayout ? "stretch" : "flex-end"}
    justify="space-between"
  >
    <Box flex={isVerticalLayout ? "auto" : 1}>
      <FormControl>
        <Input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={t('event.question.yourName')}
          disabled={isAnonymous}
          bg={bgColor}
          _dark={{ bg: "gray.700" }}
        />
      </FormControl>
    </Box>

    <HStack
      spacing={2}
      justify={isVerticalLayout ? "flex-start" : "center"}
      flex={isVerticalLayout ? "auto" : "none"}
    >
      <Switch
        id={anonymousId}
        isChecked={isAnonymous}
        onChange={(e) => setIsAnonymous(e.target.checked)}
        colorScheme="primary"
      />
      <FormLabel
        htmlFor={anonymousId}
        mb={0}
        whiteSpace="nowrap"
        cursor="pointer"
      >
        {t('event.question.askAnonymously')}
      </FormLabel>
    </HStack>

    <Box flex={isVerticalLayout ? "auto" : "none"}>
      <Button
        type="submit"
        colorScheme="blue"
        isDisabled={!content.trim()}
        width={isVerticalLayout ? "full" : "auto"}
        minW="120px"
        variant="solid"
        fontWeight="medium"
        _disabled={{
          opacity: 0.4,
          cursor: "not-allowed",
          boxShadow: "none",
        }}
      >
        {parentId ? t('event.question.reply') : t('event.question.ask')}
      </Button>
    </Box>
  </Stack>
);
