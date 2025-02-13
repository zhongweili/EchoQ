import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  Icon,
  chakra,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { MessageSquare, Users, Zap, BarChart } from "lucide-react";
import { useTranslation } from 'react-i18next';

const MotionBox = chakra(motion.div);

export const Features = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: MessageSquare,
      titleKey: 'landing.features.liveQuestions.title',
      descriptionKey: 'landing.features.liveQuestions.description',
    },
    {
      icon: Users,
      titleKey: 'landing.features.audienceEngagement.title',
      descriptionKey: 'landing.features.audienceEngagement.description',
    },
    {
      icon: Zap,
      titleKey: 'landing.features.instantResponses.title',
      descriptionKey: 'landing.features.instantResponses.description',
    },
    {
      icon: BarChart,
      titleKey: 'landing.features.analytics.title',
      descriptionKey: 'landing.features.analytics.description',
    },
  ];

  return (
    <Box as="section" py={24} bg="gray.50">
      <Container maxW="container.xl" px={4}>
        <VStack textAlign="center" mb={16} spacing={4}>
          <Heading as="h2" size="lg" color="gray.900">
            {t('landing.features.title')}
          </Heading>
          <Text color="gray.600" maxW="2xl">
            {t('landing.features.subtitle')}
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
          {features.map((feature, index) => (
            <MotionBox
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: "0.5s", delay: `${index * 0.1}s` }}
              bg="white"
              p={6}
              rounded="xl"
              shadow="sm"
              _hover={{ shadow: "md", transition: "box-shadow 0.2s" }}
            >
              <Box
                w="12"
                h="12"
                bg="primary.50"
                rounded="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={4}
              >
                <Icon as={feature.icon} boxSize={6} />
              </Box>
              <Heading as="h3" size="md" mb={2}>
                {t(feature.titleKey)}
              </Heading>
              <Text color="gray.600">
                {t(feature.descriptionKey)}
              </Text>
            </MotionBox>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};
