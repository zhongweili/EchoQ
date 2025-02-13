import { useState, useEffect } from "react";
import {
  Container,
  Flex,
  Box,
  Heading,
  SimpleGrid,
  FormLabel,
  VStack,
  Grid,
  Icon,
  Text,
  useToast,
  keyframes,
  Button,
  Input,
  InputGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Card,
  CardHeader,
  CardBody,
  Spinner,
} from "@chakra-ui/react";
import { PlusCircle, Share2, ChartBar } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslation } from 'react-i18next';
import { EventsService } from "../../client/sdk.gen"; // Update import path
import QRCode from "react-qr-code";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const datePickerStyles = {
  ".datepicker-container": {
    width: "100%",
  },
  ".react-datepicker-wrapper": {
    width: "100%",
    display: "block",
  },
  ".react-datepicker__input-container": {
    width: "100%",
    display: "block",
  },
  ".react-datepicker": {
    fontFamily: "inherit",
    border: "1px solid",
    borderColor: "gray.200",
    borderRadius: "md",
    backgroundColor: "white",
  },
  ".react-datepicker__header": {
    background: "gray.50",
    borderBottom: "1px solid",
    borderBottomColor: "gray.200",
  },
  ".react-datepicker__day--selected": {
    backgroundColor: "blue.500",
    color: "white",
  },
  ".react-datepicker__day:hover": {
    backgroundColor: "blue.100",
  }
};

interface Event {
  id: string;
  name: string;
  code: string;
  audience_peak: number | undefined;
  started_at: string | null;
  expired_at: string | null;
  owner_id: string;
}

export const Route = createFileRoute("/_layout/")({
    component: Dashboard,
  })

  // Add this custom component before the Dashboard function
  const ChakraDatePicker = ({ selected, onChange }: { selected: Date; onChange: (date: Date) => void }) => {
    return (
      <Box className="datepicker-container" w="100%">
        <ReactDatePicker
          selected={selected}
          onChange={(date: Date | null) => date && onChange(date)}
          dateFormat="yyyy-MM-dd"
          customInput={<Input width="100%" />}
          popperPlacement="bottom-start"
          popperModifiers={[
            {
              name: "offset",
              options: {
                offset: [0, 8],
              },
              fn: ({ x, y, placement, middlewareData }) => {
                return {
                  x,
                  y,
                  data: middlewareData
                };
              }
            },
          ]}
        />
      </Box>
    );
  };

  function Dashboard() {
    const { t, i18n } = useTranslation();
    const [events, setEvents] = useState<Event[]>([]);
    const [newEvent, setNewEvent] = useState({
        name: "",
        started_at: new Date(),
        audience_peak: 0,
    });
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const { isOpen: isShareOpen, onOpen: onShareOpen, onClose: onShareClose } = useDisclosure();
    const [selectedEventUrl, setSelectedEventUrl] = useState("");

    const fetchEvents = async () => {
        try {
            setIsInitialLoading(true);
            const response = await EventsService.listEvents();
            console.log('API Response:', response);
            setEvents((response.data || []) as Event[]);
        } catch (error) {
            console.error('Error fetching events:', error);
            setEvents([]);
            toast({
                title: t('dashboard.toast.fetchError'),
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsInitialLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleCreateEvent = async () => {
        if (!newEvent.name || !newEvent.started_at || !newEvent.audience_peak) {
            toast({
                title: t('dashboard.validation.fillAllFields'),
                status: "error",
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await EventsService.newEvent({
                requestBody: {
                    name: newEvent.name,
                    started_at: newEvent.started_at.toISOString(),
                    audience_peak: newEvent.audience_peak,
                }
            });

            setEvents((prev) => [...prev, response as unknown as Event]);
            onClose();
            setNewEvent({
                name: "",
                started_at: new Date(),
                audience_peak: 0,
            });

            toast({
                title: t('dashboard.toast.createSuccess'),
                description: t('dashboard.toast.createSuccessDesc'),
                status: "success",
            });
        } catch (error) {
            toast({
                title: t('dashboard.toast.createError'),
                status: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleShare = (eventId: string) => {
        // Get current language and use it in the URL
        const currentLang = i18n.language || 'en';
        const eventUrl = `${window.location.origin}/event/${currentLang}/${eventId}`;

        onShareOpen();
        setSelectedEventUrl(eventUrl);
    };

    return (
        <Container maxW="container.xl" px={4} py={8}>
        <Flex justify="space-between" align="center" mb={8}>
            <Heading as="h1" size="lg">{t('dashboard.title')}</Heading>
            <Flex gap={2}>
                <Button leftIcon={<Icon as={PlusCircle} />} onClick={onOpen}>
                    {t('dashboard.createEvent')}
                </Button>
            </Flex>

            <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{t('dashboard.modal.title')}</ModalHeader>
                <ModalBody>
                <VStack spacing={4} align="stretch">
                    <VStack align="stretch" gap={2}>
                      <FormLabel htmlFor="name">{t('dashboard.modal.eventTitle')}</FormLabel>
                      <Input
                          id="name"
                          value={newEvent.name}
                          onChange={(e) =>
                          setNewEvent((prev) => ({ ...prev, name: e.target.value }))
                          }
                          placeholder={t('dashboard.modal.eventTitlePlaceholder')}
                      />
                    </VStack>
                    <VStack align="stretch" gap={2}>
                      <FormLabel htmlFor="started_at">{t('dashboard.modal.eventDate')}</FormLabel>
                      <Box sx={datePickerStyles}>
                        <ChakraDatePicker
                          selected={newEvent.started_at}
                          onChange={(date: Date) =>
                            setNewEvent((prev) => ({ ...prev, started_at: date }))
                          }
                        />
                      </Box>
                    </VStack>
                    <VStack align="stretch" gap={2}>
                      <FormLabel htmlFor="audience_peak">{t('dashboard.modal.audiencePeak')}</FormLabel>
                      <Input
                          id="audience_peak"
                          type="number"
                          value={newEvent.audience_peak || ''}
                          onChange={(e) =>
                          setNewEvent((prev) => ({
                              ...prev,
                              audience_peak: parseInt(e.target.value) || 0,
                          }))
                          }
                          placeholder={t('dashboard.modal.audiencePeakPlaceholder')}
                      />
                    </VStack>
                    <Button
                        mt={4}
                        onClick={handleCreateEvent}
                        colorScheme="blue"
                        width="100%"
                        isLoading={isLoading}
                    >
                        {t('dashboard.modal.create')}
                    </Button>
                </VStack>
                </ModalBody>
            </ModalContent>
            </Modal>
                          </Flex>
        {isInitialLoading ? (
            <Flex justify="center" align="center" h="200px">
                <Spinner />
            </Flex>
        ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {events.map((event) => (
                <Card key={event.id} sx={{ animation: `${fadeUp} 0.3s ease-out` }}>
                    <CardHeader>
                    <Heading size="md">{event.name}</Heading>
                    </CardHeader>
                    <CardBody>
                    <VStack spacing={4} align="stretch">
                        <Text>{t('dashboard.card.date')}: {event.started_at ? new Date(event.started_at).toLocaleDateString("zh-CN") : t('dashboard.card.noDate')}</Text>
                        <Text>{t('dashboard.card.audiencePeak')}: {event.audience_peak}</Text>
                        <Flex gap={2}>
                        <Button
                            variant="outline"
                            onClick={() => handleShare(event.id)}
                            flex={1}
                            leftIcon={<Icon as={Share2} />}
                        >
                             {t('dashboard.card.share')}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                            toast({
                                title: t('dashboard.toast.statsComingSoon'),
                                description: t('dashboard.toast.pleaseWait'),
                                status: "info",
                            });
                            }}
                            flex={1}
                            leftIcon={<Icon as={ChartBar} />}
                        >
                             {t('dashboard.card.stats')}
                        </Button>
                        </Flex>
                    </VStack>
                    </CardBody>
                </Card>
                ))}
            </SimpleGrid>
        )}
        <Modal isOpen={isShareOpen} onClose={onShareClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{t('dashboard.share.title')}</ModalHeader>
                <ModalBody pb={6}>
                    <VStack spacing={4} align="center">
                        <Box p={4} bg="white" borderRadius="lg">
                            <QRCode value={selectedEventUrl} size={200} />
                        </Box>
                        <Button
                            onClick={() => {
                                navigator.clipboard.writeText(selectedEventUrl);
                                toast({
                                    title: t('dashboard.share.copied'),
                                    status: "success",
                                    duration: 2000,
                                });
                            }}
                        >
                            {t('dashboard.share.copyLink')}
                        </Button>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
        </Container>
    );
};
