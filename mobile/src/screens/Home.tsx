import { View, Text, ScrollView, Alert } from 'react-native'
import { generateDatesFromYearBeginning } from '../utils/generate-dates-from-year-beginning'
import { HabitDay, daySize } from '../components/HabitDay'
import { Header } from '../components/Header'
import { useEffect, useState, useCallback } from 'react'
import { api } from '../lib/axios'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { Loading } from '../components/Loading'
import dayjs from 'dayjs'

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const datesFromYearStart = generateDatesFromYearBeginning()
const minimunSummaryDatesSize = 18 * 5
const amountOfDaysToFill = minimunSummaryDatesSize - datesFromYearStart.length

type Summary = {
    id: string
    date: Date
    completed: number
    amount: number
}[]

export function Home() {
    const [loading, setLoading] = useState(true)
    const [summary, setSummary] = useState<Summary | null>(null)
    const { navigate } = useNavigation()

    async function fetchData() {
        try {
            setLoading(true)
            const response = await api.get('/summary');
            setSummary(response.data)
        } catch (error) {
            Alert.alert('Oops!', 'Não foi possível encontrar o sumário.')
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useFocusEffect(useCallback(() => {
        fetchData();
    }, []))

    if (loading) {
        return (
            <Loading />
        )
    }

    return (
        <View className='flex-1 bg-background px-8 pt-16'>
            <Header />
            <View className='flex-row mt-6 mb-2'>
                {weekDays.map((weekDay, i) => {
                    return (
                        <Text
                            key={`${weekDay}-${i}`}
                            className="text-zinc-400 text-xl font-bold text-center mx-1"
                            style={{ width: daySize, height: daySize }}
                        >
                            {weekDay}
                        </Text>
                    )
                })
                }
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                {
                    summary &&
                    <View className='flex-row flex-wrap mb-6'>
                        {datesFromYearStart.map(date => {
                            const dayWithHabits = summary.find(day => {
                                return dayjs(date).isSame(day.date)
                            })

                            return (
                                <HabitDay
                                    key={date.toISOString()}
                                    onPress={() => navigate('habit', { date: date.toISOString() })}
                                    completed={dayWithHabits?.completed}
                                    amount={dayWithHabits?.amount}
                                    date={date}
                                />
                            )
                        })}

                        {amountOfDaysToFill > 0 && Array.from({ length: amountOfDaysToFill }).map((_, i) => {
                            return <View
                                key={i}
                                className='bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40'
                                style={{ width: daySize, height: daySize }}
                            />
                        })}
                    </View>
                }
            </ScrollView>
        </View>
    )
}