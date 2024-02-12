import { DatabaseError, neon } from '@neondatabase/serverless'

import { EMAIL_REGEX } from '@/common/constants'
import { EMAIL_INVALID_ERROR_CODE, EMAIL_NOT_UNIQUE_ERROR_CODE, EMAIL_REQUIRED_ERROR_CODE } from '@/common/errorCodes'

export const runtime = 'edge'

const sql = neon(process.env.DATABASE_URL ?? '')

export const POST = async (request: Request) => {
  const { email } = (await request.json()) as { email: string }

  if (!email) {
    return Response.json(
      { code: EMAIL_REQUIRED_ERROR_CODE, message: 'Email is required.' },
      {
        status: 400,
      }
    )
  }

  if (!EMAIL_REGEX.test(email)) {
    return Response.json(
      { code: EMAIL_INVALID_ERROR_CODE, message: 'Email is not valid.' },
      {
        status: 400,
      }
    )
  }

  try {
    await sql`INSERT INTO mailing_list_contacts (email) VALUES (${email})`
  } catch (error) {
    if ((error as DatabaseError).code === '23505') {
      return Response.json(
        { code: EMAIL_NOT_UNIQUE_ERROR_CODE, message: 'This email has already signed up. We’ll keep you posted!' },
        {
          status: 400,
        }
      )
    } else {
      throw error
    }
  }

  return Response.json(
    { message: 'You’re in! We’ll keep you updated!' },
    {
      status: 200,
    }
  )
}
