import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  chakra,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

const MotionBox = chakra(motion.div);

export const HowItWorks: React.FC = () => {
  const { t } = useTranslation();

  const steps = [
    {
      number: "01",
      titleKey: "landing.howItWorks.steps.createSession.title",
      descriptionKey: "landing.howItWorks.steps.createSession.description",
    },
    {
      number: "02",
      titleKey: "landing.howItWorks.steps.shareWithAudience.title",
      descriptionKey: "landing.howItWorks.steps.shareWithAudience.description",
    },
    {
      number: "03",
      titleKey: "landing.howItWorks.steps.engageRealTime.title",
      descriptionKey: "landing.howItWorks.steps.engageRealTime.description",
    },
  ];

  return (
    <Box as="section" py={24}>
      <Container maxW="container.xl" px={4}>
        <VStack textAlign="center" mb={16} spacing={4}>
          <Heading as="h2" size="lg" color="gray.900">
            {t('landing.howItWorks.title')}
          </Heading>
          <Text color="gray.600" maxW="2xl">
            {t('landing.howItWorks.subtitle')}
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          {steps.map((step, index) => (
            <MotionBox
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: "0.5s", delay: `${index * 0.1}s` }}
            >
              <Box
                bg="white"
                p={8}
                rounded="xl"
                borderWidth="1px"
                borderColor="gray.100"
              >
                <Text
                  fontSize="4xl"
                  fontWeight="bold"
                  color="primary.400"
                  opacity={0.4}
                  mb={4}
                  display="block"
                >
                  {step.number}
                </Text>
                <Heading as="h3" size="md" mb={2}>
                  {t(step.titleKey)}
                </Heading>
                <Text color="gray.600">
                  {t(step.descriptionKey)}
                </Text>
              </Box>
              {index < steps.length - 1 && (
                <Box
                  display={{ base: "none", md: "block" }}
                  position="absolute"
                  top="50%"
                  right="-4"
                  w="8"
                  h="2px"
                  bg="gray.200"
                />
              )}
            </MotionBox>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};
