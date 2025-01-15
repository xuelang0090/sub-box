import { redirect } from "next/navigation"
import { getUser } from "@/server/services/authentication-service"
import { LoginForm } from "@/app/login/login-form"

export default async function Page() {
  const user = await getUser()
  if (user) {
    redirect("/")
  }

  return (
    <div className="w-full max-w-sm">
      <LoginForm />
    </div>
  )
}
