import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from '@/lib/prisma'
import { sendMail } from './email'
import { createAuthMiddleware, APIError } from 'better-auth/api'
import { passwordSchema } from './validation'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  socialProviders: {
    google: { 
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string, 
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
    }, 
  },
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({user, url}){
      await sendMail({
        to: user.email,
        subject: "Reset your password",
        text: `You can reset your password by clicking the following link: ${url}`,
      })
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url}){
      await sendMail({
        to: user.email,
        subject: "Verify your email address",
        text: `Please verify your email address by clicking the following link: ${url}`,
      })
    }
  },
  user: {
    changeEmail: {
      enabled: true,
      async sendChangeEmailVerification({ user, newEmail, url }){
        await sendMail({
          to: user.email,
          subject: "Confirm your new email address",
          text: `Please confirm your new email address (${newEmail}) by clicking the following link: ${url}`,
        })

      }
    },
    additionalFields: {
      role: {
        type: "string",
        input: false
      }
    }
  },
  hooks: {
    before: createAuthMiddleware(async (context)=>{
      if (context.path === "/sign-up/email" 
        || context.path === "/reset-password"
        || context.path === "/change-password"
      ){
        const password = context.body.password || context.body.newPassword;

        const { error } = passwordSchema.safeParse(password);

        if (error){
          throw new APIError("BAD_REQUEST", {
            message: "Password does not meet complexity requirements",
          });
        }
      }
    })
  },
  trustedOrigins: ['http://localhost:3001', 'http://localhost:3000'],
})

export type Session  = typeof auth.$Infer.Session;
export type User  = typeof auth.$Infer.Session.user;