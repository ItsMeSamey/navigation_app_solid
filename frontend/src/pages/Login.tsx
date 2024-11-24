import { createSignal,  onCleanup, onMount, Show } from 'solid-js'
import { Button } from '../components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../components/ui/card'
import { IconBrandGoogle, IconCommand } from '../components/icons'
import { GoogleUserResponse, setP, userData } from '../utils/stateManagement'


function oauthSignIn() {
  document.location.hash = ''
  const params = {
    client_id: '776982307365-bk5d4n46ujc63gr4hlbe6sncqrn6ob9i.apps.googleusercontent.com',
    redirect_uri: document.location.origin,
    response_type: 'token',
    scope: ['email', 'profile'].map(x=>'https://www.googleapis.com/auth/userinfo.'+x).join(' '),
    include_granted_scopes: 'true',
  }

  const form = (
    <form class='hidden' method='get' action='https://accounts.google.com/o/oauth2/v2/auth'>
      {Object.entries(params).map(([k,v]) => <input name={k} value={v} />)}
    </form>
  ) as HTMLFormElement

  document.body.appendChild(form)
  form.submit()
}

// hashMap format
// {
//    access_token: 'ya...',
//    authuser: '3',
//    expires_in : '3599',
//    prompt : 'consent',
//    scope : 'email%20profile%20https://www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile%20openid',
//    token_type : 'Bearer'
// }
interface GoogleAuthRequestResponse {
  access_token: string,
  authuser: string,
  expires_in: string,
  prompt: string,
  scope: string,
  token_type: string
}
function getAccessToken(): string | undefined {
  const hashMap = Object.fromEntries(document.location.hash.substring(1).split('&').map(x=>x.split('='))) as GoogleAuthRequestResponse
  return hashMap.access_token
}

async function performAuth(): Promise<boolean> {
  if (userData.get()) return false
  const token: string | undefined = getAccessToken()
  if (!token) return false;

  const response = await fetch('https://www.googleapis.com/userinfo/v2/me', { headers: {Authorization: `Bearer ${token}`} })
  const user: GoogleUserResponse = await response.json()

  console.log(response.status, user)

  userData.set(user)
  return true
}

function UserAuthForm() {
  const [error, setError] = createSignal<string | null>(null)
  const [loginText, setLoginText] = createSignal<string>('>.^.<');

  var keepLooping = true

  onCleanup(() => {
    keepLooping = false
  })

  onMount(() => {
    performAuth().then(success => {
      if (success) {
        document.location.hash = ''
        setP('Dashboard')
      }
    }).catch((err: Error) => {
      console.log(err)
      setError(err.message)
    })

    const text = 'Login to the Thapar Nav 🤟';
    function updateLoginText(index: number, increasing: boolean = true) {
      if (!keepLooping) return
      setLoginText(text.slice(0, index))
      if (increasing) {
        if (index < text.length && increasing) {
          setTimeout(() => {
            updateLoginText(index + 1)
          }, 150/Math.sqrt(text.length))
        } else if (index == text.length && increasing) {
          setTimeout(() => {
            updateLoginText(index, false)
          }, 4000)
        }
      } else {
        if (index > 1) {
          setTimeout(() => {
            updateLoginText(index - 1, false)
          }, 50/Math.sqrt(text.length))
        } else {
          setLoginText('😊')
          setTimeout(() => {
            updateLoginText(index + 1)
          }, 1000)
        }
      }
    }

    setTimeout(() => updateLoginText(1), 1000)
  })

  return <Card class='md:w-[350px] m-auto'>
    <CardHeader>
      <CardTitle class='text-center'>Login</CardTitle>
      <Show when={error()} fallback={
        <CardDescription class='text-center'>
          {loginText()}
        </CardDescription>
      }>
        <CardDescription class='text-center text-red-500'>
          {error()}
        </CardDescription>
      </Show>
    </CardHeader>
    <CardFooter class='justify-center'>
      <Button class='font-semibold text-xl' onclick={oauthSignIn}>
        Login With <IconBrandGoogle class='size-8 inline-block align-middle ml-2 animate-bounce transform-gpu will-change-transform transition antialiased' />
      </Button>
    </CardFooter>
  </Card>
}

export default function Login() {
  return (
    <div class='container relative h-full flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div class='relative hidden h-full flex-col p-10 dark:border-r lg:flex bg-muted'>
        <div class='absolute inset-0' />
        <div class='relative z-20 flex items-center text-lg font-medium'>
          <IconCommand class='mr-2 size-6' />
          Acme Inc
        </div>
        <div class='relative z-20 mt-auto'>
          <blockquote class='space-y-2'>
            <p class='text-lg'>
              &ldquo;This library has saved me countless hours of work and helped me deliver
              stunning designs to my clients faster than ever before.&rdquo;
            </p>
            <footer class='text-sm'>Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div class='lg:p-8'>
        <div class='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
          <div class='flex flex-col space-y-2 text-center'>
            <h1 class='text-2xl font-semibold tracking-tight'>Create an account</h1>
            <p class='text-sm text-muted-foreground'>
              Easy Navigation on tip of your hands
            </p>
          </div>
          <UserAuthForm />
          <p class='px-8 text-center text-sm text-muted-foreground'>
            By clicking continue, you agree to our{' '}
            <a href='/terms' class='underline underline-offset-4 hover:text-primary'>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href='/privacy' class='underline underline-offset-4 hover:text-primary'>
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

