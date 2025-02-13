import {
  Box,
  Container,
  Text,
  Heading,
  Button,
  VStack,
  Badge,
  Stack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { chakra } from "@chakra-ui/react";
import { useTranslation } from 'react-i18next';
import React from 'react';
import { useNavigate } from '@tanstack/react-router';

const MotionBox = chakra(motion.div);

export const Hero = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const productName = i18n.language === 'zh' ? '问集' : 'EchoQ';

  return (
    <Box as="section" minH={{ base: "90vh", md: "100vh" }} position="relative" overflow="hidden" bg="white">
      <Container
        centerContent
        maxW="container.xl"
        position="relative"
        zIndex={1}
        h={{ base: "90vh", md: "100vh" }}
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={{ base: 4, md: 8 }}
      >
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: "0.6s" }}
        >
          <VStack spacing={{ base: 6, md: 8 }} textAlign="center">
            <Badge
              px={3}
              py={1}
              bg="gray.100"
              color="gray.600"
              rounded="full"
              textTransform="none"
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight="medium"
            >
              {t('landing.hero.badge')}
            </Badge>

            <Heading
              as="h1"
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="bold"
              color="gray.900"
              letterSpacing="-0.02em"
              lineHeight={{ base: "1.3", md: "1.4" }}
            >
              <Text as="span" display="block" mb={2}>
                {t('landing.hero.titleFirstLine')}
              </Text>
              <Text
                as="span"
                color="primary.500"
                fontWeight="extrabold"
                px={2}
                display="inline-block"
                position="relative"
                _after={{
                  content: '""',
                  position: "absolute",
                  bottom: "-2px",
                  left: "0",
                  width: "100%",
                  height: "4px",
                  bg: "primary.100",
                  borderRadius: "full",
                  zIndex: -1
                }}
                textShadow="0 2px 4px rgba(0,0,0,0.1)"
                transition="all 0.3s ease"
                _hover={{
                  color: "primary.600",
                  transform: "translateY(-1px)"
                }}
              >
                {productName}
              </Text>
            </Heading>

            <Text
              fontSize={{ base: "md", md: "xl" }}
              color="gray.600"
              maxW="2xl"
              lineHeight="1.6"
              px={{ base: 4, md: 0 }}
            >
              {t('landing.hero.subtitle')}
            </Text>

            <Stack
              direction={{ base: "column", sm: "row" }}
              spacing={{ base: 3, md: 4 }}
              pt={{ base: 4, md: 6 }}
              w="full"
              justify="center"
            >
              <Button
                size={{ base: "md", md: "lg" }}
                bg="gray.900"
                color="white"
                px={{ base: 6, md: 8 }}
                _hover={{ bg: "gray.800" }}
                rounded="md"
                width={{ base: "full", sm: "auto" }}
                onClick={() => navigate({ to: '/login' })}
              >
                {t('landing.hero.getStarted')}
              </Button>
              <Button
                size={{ base: "md", md: "lg" }}
                variant="ghost"
                color="gray.600"
                px={{ base: 6, md: 8 }}
                _hover={{ bg: "gray.50" }}
                rounded="md"
                width={{ base: "full", sm: "auto" }}
              >
                {t('landing.hero.watchDemo')}
              </Button>
            </Stack>
          </VStack>
        </MotionBox>
      </Container>
    </Box>
  );
};
