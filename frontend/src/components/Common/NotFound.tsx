import { Button, Container, Text } from "@chakra-ui/react"
import { Link } from "@tanstack/react-router"
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <>
      <Container
        h="100vh"
        alignItems="stretch"
        justifyContent="center"
        textAlign="center"
        maxW="sm"
        centerContent
      >
        <Text
          fontSize="8xl"
          color="ui.main"
          fontWeight="bold"
          lineHeight="1"
          mb={4}
        >
          {t('common.notFound')}
        </Text>
        <Text fontSize="md">{t('common.notFoundMessage')}</Text>
        <Button
          as={Link}
          to="/"
          color="ui.main"
          borderColor="ui.main"
          variant="outline"
          mt={4}
        >
          {t('common.back')}
        </Button>
      </Container>
    </>
  )
}

export default NotFound
