import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons"
import {
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  Icon,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Text,
  useBoolean,
} from "@chakra-ui/react"
import {
  Link as RouterLink,
  createFileRoute,
  redirect,
} from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import Logo from "/assets/images/fastapi-logo.svg"
import type { Body_login_login_access_token as AccessToken } from "../client"
import useAuth, { isLoggedIn } from "../hooks/useAuth"
import { emailPattern } from "../utils"

export const Route = createFileRoute("/login")({
  component: Login,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function Login() {
  const { t } = useTranslation()
  const [show, setShow] = useBoolean()
  const { loginMutation, error, resetError } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccessToken>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit: SubmitHandler<AccessToken> = async (data) => {
    if (isSubmitting) return

    resetError()

    try {
      await loginMutation.mutateAsync(data)
    } catch {
      // error is handled by useAuth hook
    }
  }

  return (
    <>
      <Container
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        h="100vh"
        maxW="sm"
        alignItems="stretch"
        justifyContent="center"
        gap={4}
        centerContent
      >
        <Image
          src={Logo}
          alt="FastAPI logo"
          height="auto"
          maxW="2xs"
          alignSelf="center"
          mb={4}
        />
        <FormControl id="username" isInvalid={!!errors.username || !!error}>
          <Input
            id="username"
            {...register("username", {
              required: t("auth.login.emailRequired"),
              pattern: emailPattern,
            })}
            placeholder={t("auth.login.email")}
            type="email"
            required
          />
          {errors.username && (
            <FormErrorMessage>{errors.username.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl id="password" isInvalid={!!error}>
          <InputGroup>
            <Input
              {...register("password", {
                required: t("auth.login.passwordRequired"),
              })}
              type={show ? "text" : "password"}
              placeholder={t("auth.login.password")}
              required
            />
            <InputRightElement
              color="ui.dim"
              _hover={{
                cursor: "pointer",
              }}
            >
              <Icon
                as={show ? ViewOffIcon : ViewIcon}
                onClick={setShow.toggle}
                aria-label={show ? t("auth.login.hidePassword") : t("auth.login.showPassword")}
              >
                {show ? <ViewOffIcon /> : <ViewIcon />}
              </Icon>
            </InputRightElement>
          </InputGroup>
          {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>
        <Link as={RouterLink} to="/recover-password" color="blue.500">
          {t("auth.login.forgotPassword")}
        </Link>
        <Button variant="primary" type="submit" isLoading={isSubmitting}>
          {t("auth.login.submit")}
        </Button>
        <Text>
          {t("auth.login.noAccount")}{" "}
          <Link as={RouterLink} to="/signup" color="blue.500">
            {t("auth.login.signup")}
          </Link>
        </Text>
      </Container>
    </>
  )
}
