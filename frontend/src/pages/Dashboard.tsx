import { createSignal, onCleanup, onMount } from 'solid-js'

export default function Dashboard() {
  const [position, setPosition] = createSignal<{ lat: number | null; lon: number | null }>({
    lat: null,
    lon: null,
  })

  let watchNumber: number
  // Start geolocation tracking on mount
  onMount(() => {
    watchNumber = navigator.geolocation.watchPosition((pos) => {
      setPosition({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
      })
      console.log(pos)
    }, console.error, {
        enableHighAccuracy: true,
        maximumAge: 250,
        timeout: 5000,
      })
  })
  // Cleanup geolocation on unmount
  onCleanup(() => {
    if (navigator.geolocation) navigator.geolocation.clearWatch(watchNumber)
  })

  return (
    <div>
      <h1>Redirection Dashboard</h1>
      {/*Location*/}
      <div class='flex flex-col space-y-2'>
        <div class='flex-1 min-w-0'>
          <div class='flex-1 min-w-0'>
            <div class='flex items-center space-x-2'>
              <div class='flex-shrink-0 h-10 w-10 rounded-full bg-primary-500' />
              <div class='flex-1 min-w-0'>
                <div class='flex items-center space-x-2'>
                  <div class='flex-shrink-0 h-6 w-6 rounded-full bg-primary-500' />
                  <div class='min-w-0 flex-1 space-y-1'>
                    <div class='text-sm font-medium text-primary-500'>
                      <span class='truncate'>
                        <span class='text-primary-500'>
                          <span class='font-semibold'>
                            <span class='text-primary-500'>
                              Thapar Nav
                            </span>
                          </span>
                        </span>
                      </span>
                    </div>
                    {position().lat !== null && position().lon !== null &&
                      <>
                        {' '}
                        <div class='text-sm text-muted-foreground'>
                          <span class='truncate'>
                            <span class='text-muted-foreground'>
                              <span class='font-semibold'>
                                <span class='text-muted-foreground'>
                                  <span class='font-semibold'>
                                    Lat: {position().lat?.toFixed(4)}
                                  </span>
                                </span>
                              </span>
                            </span>
                          </span>
                        </div>
                        {' '}
                        &nbsp;
                        {" "}
                        <div class='text-sm text-muted-foreground'>
                          <span class='truncate'>
                            <span class='text-muted-foreground'>
                              <span class='font-semibold'>
                                <span class='text-muted-foreground'>
                                  <span class='font-semibold'>
                                    Lon: {position().lon?.toFixed(4)}
                                  </span>
                                </span>
                              </span>
                            </span>
                          </span>
                        </div>
                      </>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

