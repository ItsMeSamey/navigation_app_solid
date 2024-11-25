import { createSignal, For, Show, onMount, onCleanup, createEffect } from 'solid-js'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/registry/ui/card'
import { GetLocations, LocationInfo } from '../utils/fetch'
import { IconExternalLink } from '~/components/icons'
import { Badge } from '~/registry/ui/badge'
import ModeToggle from '../components/ModeToggle'
import { Accessor } from 'solid-js'
import { Toaster } from '~/registry/ui/toast'

const [geolocation, setGeolocation] = createSignal<{lat?: number, long?: number}>({})


function AsBadges({keys, ...props}: {vals: string[]} extends any? any: any) {
  return <For each={keys}>{key => <Badge {...props}>{key}</Badge>}</For>
}

function LocationList({list}: {list: Accessor<LocationInfo[]>}) {
  return (
    <>
      <For each={list()?? []}>
        {(location) => (
          <span
            class='group flex py-1 flex-col items-start gap-2 rounded-lg border p-3 mx-4 my-2 text-left text-sm transition-all cursor-pointer'
            onclick={e => {
              e.preventDefault()
              e.stopPropagation()
              window.open(`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.long}`, '_blank')
            }}
          >
            <div class='flex w-full flex-col gap-1'>
              <div class='flex items-center'>
                <AsBadges keys={location.names} class='bg-muted/50 mr-1 text-foreground hover:bg-muted-foreground' />
                <div class='ml-auto text-xs flex gap-1'>
                  <span class="p-1 border rounded group-hover:bg-foreground transition-all duration-500">
                    <IconExternalLink class="group-hover:stroke-background" />
                  </span>
                </div>
              </div>
            </div>
          </span>
        )}
      </For>
    </>
  )
}

export default function LocationManager() {
  var watchId: number

  createEffect(() => {
    console.log(geolocation())
  })

  onMount(() => {
    watchId = navigator.geolocation.watchPosition((w) => {
      setGeolocation({
        lat: w.coords.latitude,
        long: w.coords.longitude,
      })
    })
  })

  onCleanup(() => {
    navigator.geolocation.clearWatch(watchId)
  })

  const [error, setError] = createSignal<string>('')
  const [list, setList] = createSignal<LocationInfo[]>([], { equals: false })

  function updateLocationsList() { GetLocations().then(setList).catch(setError) }
  updateLocationsList()

  return (
    <>
      <Toaster />
      <Card>
        <CardHeader>
          <div class='flex flex-row items-center'>
            <div class='mr-auto'>
              <CardTitle>Locations</CardTitle>
              <CardDescription>Manage your locations</CardDescription>
            </div>
            <div class='mr-[-1rem] mt-[-2rem] flex flex-row items-center gap-2'>
              <ModeToggle/>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Show when={error()}>
            <span class='flex flex-col gap-2 text-red-500 text-center px-10'>
              {error()}
            </span>
          </Show>
          <LocationList list={list}/>
        </CardContent>
      </Card>
    </>
  )
}

