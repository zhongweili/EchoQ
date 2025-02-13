import {
  Button,
  Container,
  Heading,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { useTranslation } from "react-i18next"
import DeleteConfirmation from "./DeleteConfirmation"

const DeleteAccount = () => {
  const confirmationModal = useDisclosure()
  const { t } = useTranslation()

  return (
    <>
      <Container maxW="full">
        <Heading size="sm" py={4}>
          Delete Account
        </Heading>
        <Text>
          {t('common.deleteAccount')}
        </Text>
        <Button variant="danger" mt={4} onClick={confirmationModal.onOpen}>
          {t('common.accountDelete')}
        </Button>
        <DeleteConfirmation
          isOpen={confirmationModal.isOpen}
          onClose={confirmationModal.onClose}
        />
      </Container>
    </>
  )
}
export default DeleteAccount
