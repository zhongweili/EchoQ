import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  chakra,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
const MotionBox = chakra(motion.div);

export const CTA = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Box as="section" py={24} bg="gray.900" color="white">
      <Container maxW="container.xl" px={4}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: "0.5s" }}
          maxW="3xl"
          mx="auto"
          textAlign="center"
        >
          <Heading
            as="h2"
            fontSize={{ base: "3xl", md: "4xl" }}
            fontWeight="bold"
            mb={6}
          >
            {t('landing.cta.title')}
          </Heading>
          <Text color="gray.400" mb={8}>
            {t('landing.cta.subtitle')}
          </Text>
          <Button
            size="lg"
            bg="white"
            color="gray.900"
            rounded="lg"
            px={8}
            _hover={{ bg: "gray.100" }}
            onClick={() => navigate({ to: '/login' })}
          >
            {t('landing.cta.button')}
          </Button>
        </MotionBox>
      </Container>
    </Box>
  );
};
