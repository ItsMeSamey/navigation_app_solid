import { createSignal, For, Show, Setter } from 'solid-js'
import { TextFieldInput, TextField } from '~/registry/ui/text-field'
import { Card, CardContent, CardHeader } from '~/registry/ui/card'
import { Toaster } from '~/registry/ui/toast'
import { Badge } from '~/registry/ui/badge'
import { GetLocations, LocationInfo } from '../utils/fetch'
import ModeToggle from '../components/ModeToggle'
import { Accessor } from 'solid-js'
import { search, sortKind } from 'fast-fuzzy'
import { IconExternalLink, IconSearch } from '~/components/icons'

function AsBadges({keys, ...props}: {vals: string[]} extends any? any: any) {
  return <For each={keys}>{key => <Badge {...props}>{key}</Badge>}</For>
}

function LocationList({list, searchText}: {list: Accessor<LocationInfo[]>, searchText: Accessor<string>}) {
  function filteredArray(text: string, keyWords: LocationInfo[]): LocationInfo[] {
    const result = search(text, keyWords, {
      ignoreCase: true,
      ignoreSymbols: true,
      normalizeWhitespace: true,
      sortBy: sortKind.bestMatch,
      threshold: 0.5,
      keySelector: x => [...(x.names??[]), ...(x.misspellings??[])],
    })
    return result
  }

  return (
    <>
      <For each={searchText().trim().length > 0 ? filteredArray(searchText(), list() ?? []) : list()}>
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

function SearchBar({ text, setText }: { text: Accessor<string>, setText: Setter<string> }) {
  return (
    <div class='hover:bg-muted flex flex-row items-center gap-2 rounded group px-0'>
      <TextField class='px-2 flex flex-row items-center'>
        <IconSearch class='group-hover:scale-125 stroke-foreground transition-all duration-500 transform-gpu will-change-transform' />
        <TextFieldInput
          id='searchBar'
          type='text'
          class='rounded border border-foreground bg-background px-2 py-1 text-sm group-hover:bg-muted border-none focus:border-none mr-0'
          placeholder='Search Locations'
          value={text()}
          onInput={(e) => setText(e.currentTarget.value)}
        />
      </TextField>
    </div>
  )
}

export default function LocationManager() {
  const [error, setError] = createSignal<string>('')
  const [list, setList] = createSignal<LocationInfo[]>([], { equals: false })
  const [search, setSearch] = createSignal<string>('', {
    equals: false,
  })

  window.onkeydown = k => {
    if (k.key === 'Escape') {
      setSearch('')
      document.getElementById('root')!.click()
    } else {
      document.getElementById('searchBar')?.focus()
    }
  }

  function updateLocationsList() { GetLocations().then(setList).catch(setError) }
  updateLocationsList()

  return (
    <>
      <Toaster />
      <Card>
        <CardHeader>
          <div class='flex flex-row items-center'>
            <div class='mr-auto'>
              <SearchBar text={search} setText={setSearch}/>
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
          <LocationList list={list} searchText={search} />
        </CardContent>
      </Card>
    </>
  )
}

