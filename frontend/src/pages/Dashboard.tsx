import { createSignal, onCleanup, onMount } from 'solid-js'

import {
	DatePicker,
	DatePickerContent,
	DatePickerContext,
	DatePickerControl,
	DatePickerInput,
	DatePickerPositioner,
	DatePickerRangeText,
	DatePickerTable,
	DatePickerTableBody,
	DatePickerTableCell,
	DatePickerTableCellTrigger,
	DatePickerTableHead,
	DatePickerTableHeader,
	DatePickerTableRow,
	DatePickerTrigger,
	DatePickerView,
	DatePickerViewControl,
	DatePickerViewTrigger,
} from "@shadui/date-picker"
import { Index } from "solid-js";
import { Portal } from "solid-js/web";

const DatePickerDemo = () => {
	return (
		<DatePicker>
			<DatePickerControl>
				<DatePickerInput />
				<DatePickerTrigger />
			</DatePickerControl>
			<Portal>
				<DatePickerPositioner>
					<DatePickerContent>
						<DatePickerView view="day">
							<DatePickerContext>
								{(context) => (
									<>
										<DatePickerViewControl>
											<DatePickerViewTrigger>
												<DatePickerRangeText />
											</DatePickerViewTrigger>
										</DatePickerViewControl>
										<DatePickerTable>
											<DatePickerTableHead>
												<DatePickerTableRow>
													<Index each={context().weekDays}>
														{(weekDay) => (
															<DatePickerTableHeader>
																{weekDay().short}
															</DatePickerTableHeader>
														)}
													</Index>
												</DatePickerTableRow>
											</DatePickerTableHead>
											<DatePickerTableBody>
												<Index each={context().weeks}>
													{(week) => (
														<DatePickerTableRow>
															<Index each={week()}>
																{(day) => (
																	<DatePickerTableCell value={day()}>
																		<DatePickerTableCellTrigger>
																			{day().day}
																		</DatePickerTableCellTrigger>
																	</DatePickerTableCell>
																)}
															</Index>
														</DatePickerTableRow>
													)}
												</Index>
											</DatePickerTableBody>
										</DatePickerTable>
									</>
								)}
							</DatePickerContext>
						</DatePickerView>
						<DatePickerView view="month">
							<DatePickerContext>
								{(context) => (
									<>
										<DatePickerViewControl>
											<DatePickerViewTrigger>
												<DatePickerRangeText />
											</DatePickerViewTrigger>
										</DatePickerViewControl>
										<DatePickerTable>
											<DatePickerTableBody>
												<Index
													each={context().getMonthsGrid({
														columns: 4,
														format: "short",
													})}
												>
													{(months) => (
														<DatePickerTableRow>
															<Index each={months()}>
																{(month) => (
																	<DatePickerTableCell value={month().value}>
																		<DatePickerTableCellTrigger>
																			{month().label}
																		</DatePickerTableCellTrigger>
																	</DatePickerTableCell>
																)}
															</Index>
														</DatePickerTableRow>
													)}
												</Index>
											</DatePickerTableBody>
										</DatePickerTable>
									</>
								)}
							</DatePickerContext>
						</DatePickerView>
						<DatePickerView view="year">
							<DatePickerContext>
								{(context) => (
									<>
										<DatePickerViewControl>
											<DatePickerViewTrigger>
												<DatePickerRangeText />
											</DatePickerViewTrigger>
										</DatePickerViewControl>
										<DatePickerTable>
											<DatePickerTableBody>
												<Index
													each={context().getYearsGrid({
														columns: 4,
													})}
												>
													{(years) => (
														<DatePickerTableRow>
															<Index each={years()}>
																{(year) => (
																	<DatePickerTableCell value={year().value}>
																		<DatePickerTableCellTrigger>
																			{year().label}
																		</DatePickerTableCellTrigger>
																	</DatePickerTableCell>
																)}
															</Index>
														</DatePickerTableRow>
													)}
												</Index>
											</DatePickerTableBody>
										</DatePickerTable>
									</>
								)}
							</DatePickerContext>
						</DatePickerView>
					</DatePickerContent>
				</DatePickerPositioner>
			</Portal>
		</DatePicker>
	);
};

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
      <DatePickerDemo />
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

