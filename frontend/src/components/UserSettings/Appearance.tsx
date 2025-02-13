import {
  Badge,
  Container,
  Heading,
  Radio,
  RadioGroup,
  Stack,
  useColorMode,
} from "@chakra-ui/react"
import { useTranslation } from "react-i18next"

const Appearance = () => {
  const { t } = useTranslation()
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <>
      <Container maxW="full">
        <Heading size="sm" py={4}>
          {t('common.appearance')}
        </Heading>
        <RadioGroup onChange={toggleColorMode} value={colorMode}>
          <Stack>
            {/* TODO: Add system default option */}
            <Radio value="light" colorScheme="teal">
              {t('common.lightMode')}
              <Badge ml="1" colorScheme="teal">
                {t('common.systemDefault')}
              </Badge>
            </Radio>
            <Radio value="dark" colorScheme="teal">
              {t('common.darkMode')}
            </Radio>
          </Stack>
        </RadioGroup>
      </Container>
    </>
  )
}
export default Appearance
