"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password tidak boleh kosong"),
})

export default function LoginPage() {
  const router = useRouter()
  const { setRole, setUserName } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("Received non-JSON response from server")
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Gagal masuk")
      }

      // Update context and storage
      if (typeof window !== "undefined") {
        localStorage.setItem("user-name", data.name || "User")
      }
      
      setRole(data.role)
      setUserName(data.name || "User")

      // Refresh to update middleware state / cookies
      router.refresh()
      
      // Redirect based on role
      if (data.role === "admin" || data.role === "teacher") {
        router.push("/dashboard")
      } else {
        router.push("/")
      }
      
    } catch (err) {
      console.error("Login error:", err)
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError("Gagal menghubungi server. Periksa koneksi internet Anda.")
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Terjadi kesalahan yang tidak diketahui")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-8 shadow-lg">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-amber-500">
            Masuk ke Museum
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Akses materi dan fitur pembelajaran
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@contoh.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-amber-500 hover:text-amber-400">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
