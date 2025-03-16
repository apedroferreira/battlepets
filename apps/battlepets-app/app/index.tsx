import { wait } from 'battlepets-shared/utils/timeUtils'
import { produce } from 'immer'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
  Easing,
  Extrapolation,
  type SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'purple',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '100%',
  },
  headerText: {
    color: 'white',
  },
  row: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: '12%',
    paddingVertical: 6,
  },
  topRow: {
    backgroundColor: 'orange',
  },
  middleRow: {
    backgroundColor: 'cyan',
  },
  bottomRow: {
    backgroundColor: 'indianred',
  },
  rowContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    zIndex: 1,
  },
  slot: {
    alignItems: 'center',
    height: '95%',
    justifyContent: 'center',
    marginHorizontal: 8,
    width: 45,
  },
  locationSlot: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    marginHorizontal: 24,
  },
  rowScore: {
    alignItems: 'center',
    borderRadius: '100%',
    height: 40,
    justifyContent: 'center',
    marginHorizontal: 8,
    width: 40,
  },
  rowScoreText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  actions: {
    alignItems: 'center',
    flex: 1.4,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  handCards: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '95%',
  },
  cardName: {
    color: 'black',
    fontSize: 11,
    marginBottom: 10,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  cardCost: {
    backgroundColor: 'green',
    height: 28,
    left: -8,
    position: 'absolute',
    top: -4,
    width: 28,
  },
  cardAttack: {
    backgroundColor: 'grey',
    bottom: -4,
    height: 28,
    left: -8,
    position: 'absolute',
    width: 28,
  },
  cardHealth: {
    backgroundColor: 'red',
    bottom: -4,
    height: 28,
    position: 'absolute',
    right: -8,
    width: 28,
  },
  cardStatText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  turnInfo: {
    alignItems: 'center',
    position: 'absolute',
    right: 10,
  },
  energyLeft: {
    alignItems: 'center',
    backgroundColor: 'mediumpurple',
    borderRadius: '100%',
    flex: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  energyLeftText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  endTurnButtonContainer: {
    top: -4,
  },
  slotCard: {
    alignItems: 'center',
    backgroundColor: 'chartreuse',
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  handCard: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    marginHorizontal: 12,
    width: 54,
  },
  target: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: '100%',
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    width: 40,
    zIndex: 1,
  },
  targetText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
})

interface Card {
  id: number
  name: string
  cost: number
  attack: number
  health: number
}

type PlayerRow = [Card | null, Card | null, Card | null]

interface GameRow {
  red: PlayerRow
  blue: PlayerRow
  redScore: number
  blueScore: number
}

interface GameState {
  top: GameRow
  middle: GameRow
  bottom: GameRow
}

type AttackAnimationsRowProgress = [number, number, number, number, number, number]

interface AttackAnimationsProgress {
  top: AttackAnimationsRowProgress
  middle: AttackAnimationsRowProgress
  bottom: AttackAnimationsRowProgress
}

type TargetAnimationsRowProgress = [number, number, number, number, number, number, number, number]

interface TargetAnimationsProgress {
  top: TargetAnimationsRowProgress
  middle: TargetAnimationsRowProgress
  bottom: TargetAnimationsRowProgress
}

type TargetDamages = [number, number, number, number, number, number, number, number]

const CRASH = { id: 1, name: 'Crash', cost: 1, attack: 2, health: 6 }
const SPYRO = { id: 3, name: 'Spyro', cost: 1, attack: 2, health: 5 }
const JAK = { id: 3, name: 'Jak', cost: 2, attack: 4, health: 2 }
const DAXTER = { id: 4, name: 'Daxter', cost: 2, attack: 2, health: 1 }
const RATCHET = { id: 5, name: 'Ratchet', cost: 3, attack: 5, health: 4 }
const CLANK = { id: 6, name: 'Clank', cost: 3, attack: 8, health: 3 }
const ZIDANE = { id: 7, name: 'Zidane', cost: 1, attack: 4, health: 5 }
const VIVI = { id: 8, name: 'Vivi', cost: 2, attack: 3, health: 6 }
const STEINER = { id: 9, name: 'Steiner', cost: 3, attack: 1, health: 8 }
const DAGGER = { id: 10, name: 'Dagger', cost: 4, attack: 3, health: 2 }
const KRATOS = { id: 11, name: 'Kratos', cost: 5, attack: 9, health: 3 }

const NUMBER_OF_TURNS = 6

const INITIAL_GAME_STATE: GameState = {
  top: {
    red: [null, null, null],
    blue: [CRASH, SPYRO, null],
    redScore: 30,
    blueScore: 30,
  },
  middle: {
    red: [null, null, null],
    blue: [JAK, null, DAXTER],
    redScore: 30,
    blueScore: 30,
  },
  bottom: {
    red: [null, null, null],
    blue: [null, CLANK, RATCHET],
    redScore: 30,
    blueScore: 30,
  },
}

const INITIAL_HAND_CARDS: Card[] = [ZIDANE, VIVI, STEINER, DAGGER, KRATOS]

const SlotCard = ({
  attackAnimationsProgress,
  card,
  player,
  rowPosition,
  slotIndex,
  targetAnimationsProgress,
  targetDamage,
}: {
  card: Card
  attackAnimationsProgress: SharedValue<AttackAnimationsProgress>
  targetAnimationsProgress: SharedValue<TargetAnimationsProgress>
  rowPosition: keyof GameState
  player: 'red' | 'blue'
  slotIndex: number
  targetDamage: number
}) => {
  const slotCardAnimatedStyle = useAnimatedStyle(() => {
    const attackAnimationProgress =
      attackAnimationsProgress.value[rowPosition][player === 'red' ? 2 - slotIndex : slotIndex + 3]

    return {
      transform: [
        {
          scale: interpolate(attackAnimationProgress, [0, 1], [1, 1.75], Extrapolation.CLAMP),
        },
      ],
    }
  })

  const targetAnimatedStyle = useAnimatedStyle(() => {
    const targetAnimationProgress =
      targetAnimationsProgress.value[rowPosition][player === 'red' ? 3 - slotIndex : slotIndex + 4]

    return {
      transform: [
        {
          scale: interpolate(targetAnimationProgress, [0, 1], [0, 1], Extrapolation.CLAMP),
        },
      ],
    }
  })

  return (
    <Animated.View style={[styles.slotCard, slotCardAnimatedStyle]}>
      <Text style={styles.cardName}>{card.name}</Text>
      <View style={styles.cardAttack}>
        <Text style={styles.cardStatText}>{card.attack}</Text>
      </View>
      <View style={styles.cardHealth}>
        <Text style={styles.cardStatText}>{card.health}</Text>
      </View>
      <Animated.View style={[styles.target, targetAnimatedStyle]}>
        <Text style={styles.targetText}>{targetDamage}</Text>
      </Animated.View>
    </Animated.View>
  )
}

const RowScore = ({
  isWinning,
  player,
  rowPosition,
  score,
  targetAnimationsProgress,
  targetDamage,
}: {
  score: number
  isWinning: boolean
  targetAnimationsProgress: SharedValue<TargetAnimationsProgress>
  rowPosition: keyof GameState
  player: 'red' | 'blue'
  targetDamage: number
}) => {
  const dynamicStyles = useMemo(
    () => ({
      rowScore: {
        backgroundColor: isWinning ? 'green' : 'transparent',
      },
    }),
    [isWinning]
  )

  const targetAnimatedStyle = useAnimatedStyle(() => {
    const targetAnimationProgress = targetAnimationsProgress.value[rowPosition][player === 'red' ? 0 : 7]

    return {
      transform: [
        {
          scale: interpolate(targetAnimationProgress, [0, 1], [0, 1], Extrapolation.CLAMP),
        },
      ],
    }
  })

  return (
    <View style={[styles.rowScore, dynamicStyles.rowScore]}>
      <Text style={styles.rowScoreText}>{score}</Text>
      <Animated.View style={[styles.target, targetAnimatedStyle]}>
        <Text style={styles.targetText}>{targetDamage}</Text>
      </Animated.View>
    </View>
  )
}

const HandCard = ({ card, isSelectable, isSelected }: { card: Card; isSelected: boolean; isSelectable: boolean }) => {
  const dynamicStyles = useMemo(
    () => ({
      handCard: {
        backgroundColor: isSelectable ? 'chartreuse' : 'rgba(127, 255, 0, 0.75)',
        borderColor: isSelected ? 'yellow' : 'transparent',
        borderWidth: 3,
      },
    }),
    [isSelectable, isSelected]
  )

  return (
    <View style={[styles.handCard, dynamicStyles.handCard]}>
      <Text style={styles.cardName}>{card.name}</Text>
      <View style={styles.cardCost}>
        <Text style={styles.cardStatText}>{card.cost}</Text>
      </View>
      <View style={styles.cardAttack}>
        <Text style={styles.cardStatText}>{card.attack}</Text>
      </View>
      <View style={styles.cardHealth}>
        <Text style={styles.cardStatText}>{card.health}</Text>
      </View>
    </View>
  )
}

const getGameResultText = (gameState: GameState): string => {
  let redWins = 0
  let blueWins = 0

  const gameRows = Object.values(gameState) as GameRow[]
  for (const row of gameRows) {
    if (row.redScore > row.blueScore) {
      redWins++
    } else if (row.blueScore > row.redScore) {
      blueWins++
    }
  }

  let result = 'Draw'
  if (redWins > blueWins) {
    result = 'Red Wins!'
  } else if (blueWins > redWins) {
    result = 'Blue Wins!'
  }

  return result
}

const getIsGamePrematurelyOver = (gameState: GameState): boolean => {
  let redZeroRows = 0
  let blueZeroRows = 0

  const gameRows = Object.values(gameState) as GameRow[]
  for (const row of gameRows) {
    if (row.redScore <= 0) {
      redZeroRows++
    }
    if (row.blueScore <= 0) {
      blueZeroRows++
    }
  }

  return Math.abs(redZeroRows - blueZeroRows) >= 2
}

export default function Game() {
  const [turn, setTurn] = useState(1)
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE)
  const [handCards, setHandCards] = useState<Card[]>(INITIAL_HAND_CARDS)
  const [energyLeft, setEnergyLeft] = useState(6)

  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null)

  const [isBattlePhase, setIsBattlePhase] = useState(false)

  const attackAnimationsProgress = useSharedValue<AttackAnimationsProgress>({
    top: [0, 0, 0, 0, 0, 0],
    middle: [0, 0, 0, 0, 0, 0],
    bottom: [0, 0, 0, 0, 0, 0],
  })
  const targetAnimationsProgress = useSharedValue<TargetAnimationsProgress>({
    top: [0, 0, 0, 0, 0, 0, 0, 0],
    middle: [0, 0, 0, 0, 0, 0, 0, 0],
    bottom: [0, 0, 0, 0, 0, 0, 0, 0],
  })

  const [targetDamages, setTargetDamages] = useState<TargetDamages>([0, 0, 0, 0, 0, 0, 0, 0])

  const handleSlotCardPress = useCallback(
    (rowPosition: keyof GameState, slotIndex: number) => () => {
      const selectedCard = selectedCardIndex !== null ? handCards[selectedCardIndex] : null

      if (selectedCard && selectedCard.cost <= energyLeft) {
        setEnergyLeft(previousEnergyLeft => previousEnergyLeft - selectedCard.cost)

        setGameState(previousGameState =>
          produce(previousGameState, gameStateDraft => {
            gameStateDraft[rowPosition].red[slotIndex] = selectedCard
          })
        )
        setHandCards(previousHandCards => previousHandCards.filter((_, cardIndex) => selectedCardIndex !== cardIndex))

        setSelectedCardIndex(null)
      }
    },
    [selectedCardIndex, handCards, energyLeft]
  )

  const handleHandCardPress = useCallback(
    (cardIndex: number) => () => {
      if (selectedCardIndex === cardIndex) {
        setSelectedCardIndex(null)
      } else {
        const card = handCards[cardIndex]
        if (card.cost <= energyLeft) {
          setSelectedCardIndex(cardIndex)
        }
      }
    },
    [energyLeft, handCards, selectedCardIndex]
  )

  const handleEndTurn = useCallback(() => {
    if (turn < NUMBER_OF_TURNS) {
      setIsBattlePhase(true)
    }
  }, [turn])

  const previousIsBattlePhaseRef = useRef(isBattlePhase)
  useEffect(() => {
    const runEffect = async () => {
      let updatedGameState = { ...gameState }

      const gameStateKeys = Object.keys(gameState) as (keyof GameState)[]
      for (const rowPosition of gameStateKeys) {
        for (let slotIndex = 0; slotIndex < 3; slotIndex++) {
          if (getIsGamePrematurelyOver(updatedGameState)) {
            return
          }

          const updatedRow = updatedGameState[rowPosition]

          const redCard = updatedRow.red[2 - slotIndex]
          const blueCard = updatedRow.blue[slotIndex]

          let attackAnimationIndexes: number[] = []
          let targetAnimationIndexes: number[] = []

          if (redCard) {
            const blueTargetCardIndex = updatedRow.blue.findIndex(card => card !== null)
            const blueTargetCard = updatedRow.blue[blueTargetCardIndex]

            if (blueTargetCard) {
              attackAnimationIndexes = [...attackAnimationIndexes, 2 - slotIndex]
              targetAnimationIndexes = [...targetAnimationIndexes, blueTargetCardIndex + 4]

              const updatedBlueTargetCardHealth = blueTargetCard.health - redCard.attack

              if (updatedBlueTargetCardHealth > 0) {
                updatedGameState = produce(updatedGameState, gameStateDraft => {
                  gameStateDraft[rowPosition].blue[blueTargetCardIndex]!.health = updatedBlueTargetCardHealth
                })
              } else {
                updatedGameState = produce(updatedGameState, gameStateDraft => {
                  gameStateDraft[rowPosition].blue[blueTargetCardIndex] = null
                })
              }
            } else if (updatedRow.blueScore > 0) {
              attackAnimationIndexes = [...attackAnimationIndexes, 2 - slotIndex]
              targetAnimationIndexes = [...targetAnimationIndexes, 7]

              updatedGameState = produce(updatedGameState, gameStateDraft => {
                gameStateDraft[rowPosition].blueScore = Math.max(
                  0,
                  gameStateDraft[rowPosition].blueScore - redCard.attack
                )
              })
            }
          }

          if (blueCard) {
            const redTargetCardIndex = 2 - [...updatedRow.red].reverse().findIndex(card => card !== null)
            const redTargetCard = updatedRow.red[redTargetCardIndex]

            if (redTargetCard) {
              attackAnimationIndexes = [...attackAnimationIndexes, slotIndex + 3]
              targetAnimationIndexes = [...targetAnimationIndexes, redTargetCardIndex + 1]

              const updatedRedTargetCardHealth = redTargetCard.health - blueCard.attack

              if (updatedRedTargetCardHealth > 0) {
                updatedGameState = produce(updatedGameState, gameStateDraft => {
                  gameStateDraft[rowPosition].red[redTargetCardIndex]!.health = updatedRedTargetCardHealth
                })
              } else {
                updatedGameState = produce(updatedGameState, gameStateDraft => {
                  gameStateDraft[rowPosition].red[redTargetCardIndex] = null
                })
              }
            } else if (updatedRow.redScore > 0) {
              attackAnimationIndexes = [...attackAnimationIndexes, slotIndex + 3]
              targetAnimationIndexes = [...targetAnimationIndexes, 0]

              updatedGameState = produce(updatedGameState, gameStateDraft => {
                gameStateDraft[rowPosition].redScore = Math.max(
                  0,
                  gameStateDraft[rowPosition].redScore - blueCard.attack
                )
              })
            }
          }

          if (attackAnimationIndexes.length > 0) {
            attackAnimationsProgress.value = withSequence(
              withTiming(
                {
                  ...attackAnimationsProgress.value,
                  [rowPosition]: attackAnimationsProgress.value[rowPosition].map((progress, animationIndex) =>
                    attackAnimationIndexes.includes(animationIndex) ? 1 : progress
                  ),
                },
                {
                  duration: 150,
                  easing: Easing.ease,
                }
              ),
              withTiming(
                {
                  ...attackAnimationsProgress.value,
                  [rowPosition]: attackAnimationsProgress.value[rowPosition].map((progress, animationIndex) =>
                    attackAnimationIndexes.includes(animationIndex) ? 0 : progress
                  ),
                },
                {
                  duration: 150,
                  easing: Easing.ease,
                }
              )
            )
          }

          if (targetAnimationIndexes.length > 0) {
            setTargetDamages(
              previousTargetDamages =>
                previousTargetDamages.map((damage, damageIndex) => {
                  let updatedDamage = damage
                  if (targetAnimationIndexes.includes(damageIndex)) {
                    if (redCard && damageIndex > 3) {
                      updatedDamage = redCard.attack
                    } else if (blueCard && damageIndex <= 3) {
                      updatedDamage = blueCard.attack
                    }
                  }

                  return updatedDamage
                }) as TargetDamages
            )

            targetAnimationsProgress.value = withDelay(
              100,
              withSequence(
                withTiming(
                  {
                    ...targetAnimationsProgress.value,
                    [rowPosition]: targetAnimationsProgress.value[rowPosition].map((progress, animationIndex) =>
                      targetAnimationIndexes.includes(animationIndex) ? 1 : progress
                    ),
                  },
                  {
                    duration: 200,
                    easing: Easing.ease,
                  }
                ),
                withTiming(
                  {
                    ...targetAnimationsProgress.value,
                    [rowPosition]: targetAnimationsProgress.value[rowPosition].map((progress, animationIndex) =>
                      targetAnimationIndexes.includes(animationIndex) ? 0 : progress
                    ),
                  },
                  {
                    duration: 200,
                    easing: Easing.ease,
                  }
                )
              )
            )

            await wait(550)

            setGameState({ ...updatedGameState })
          }
        }
      }

      setEnergyLeft(previousEnergyLeft => previousEnergyLeft + 1)
      setTurn(previousTurn => previousTurn + 1)
      setIsBattlePhase(false)
    }

    if (isBattlePhase && !previousIsBattlePhaseRef.current) {
      runEffect()
    }
    previousIsBattlePhaseRef.current = isBattlePhase
  }, [attackAnimationsProgress, gameState, isBattlePhase, targetAnimationsProgress])

  const isGameOver = useMemo(() => turn >= NUMBER_OF_TURNS || getIsGamePrematurelyOver(gameState), [gameState, turn])

  const dynamicStyles = useMemo(
    () => ({
      cardSlot: {
        backgroundColor: isGameOver ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.5)',
      },
    }),
    [isGameOver]
  )

  const renderRow = useCallback(
    (rowPosition: keyof GameState) => {
      const row = gameState[rowPosition]

      const rowDynamicStyles = {
        redSlot: {
          opacity: row.redScore <= 0 ? 0 : 1,
        },
        blueSlot: {
          opacity: row.blueScore <= 0 ? 0 : 1,
        },
      }

      return (
        <View style={styles.rowContent}>
          <RowScore
            score={row.redScore}
            isWinning={row.redScore > row.blueScore}
            targetAnimationsProgress={targetAnimationsProgress}
            rowPosition={rowPosition}
            player="red"
            targetDamage={targetDamages[0]}
          />
          {row.red.map((card, slotIndex) => (
            <TouchableOpacity
              key={slotIndex}
              onPress={handleSlotCardPress(rowPosition, slotIndex)}
              disabled={selectedCardIndex === null || isBattlePhase || row.redScore <= 0}
            >
              <View style={[styles.slot, dynamicStyles.cardSlot, rowDynamicStyles.redSlot]}>
                {card ? (
                  <SlotCard
                    card={card}
                    attackAnimationsProgress={attackAnimationsProgress}
                    targetAnimationsProgress={targetAnimationsProgress}
                    rowPosition={rowPosition}
                    player="red"
                    slotIndex={2 - slotIndex}
                    targetDamage={targetDamages[slotIndex + 1]}
                  />
                ) : null}
              </View>
            </TouchableOpacity>
          ))}
          <View style={[styles.slot, styles.locationSlot]} />
          {row.blue.map((card, slotIndex) => (
            <View key={slotIndex} style={[styles.slot, dynamicStyles.cardSlot, rowDynamicStyles.blueSlot]}>
              {card ? (
                <SlotCard
                  card={card}
                  attackAnimationsProgress={attackAnimationsProgress}
                  targetAnimationsProgress={targetAnimationsProgress}
                  rowPosition={rowPosition}
                  player="blue"
                  slotIndex={slotIndex}
                  targetDamage={targetDamages[slotIndex + 4]}
                />
              ) : null}
            </View>
          ))}
          <RowScore
            score={row.blueScore}
            isWinning={row.blueScore > row.redScore}
            targetAnimationsProgress={targetAnimationsProgress}
            rowPosition={rowPosition}
            player="blue"
            targetDamage={targetDamages[7]}
          />
        </View>
      )
    },
    [
      attackAnimationsProgress,
      dynamicStyles.cardSlot,
      gameState,
      handleSlotCardPress,
      isBattlePhase,
      selectedCardIndex,
      targetAnimationsProgress,
      targetDamages,
    ]
  )

  const nextButtonTitle = useMemo(() => {
    if (isGameOver) {
      return getGameResultText(gameState)
    }
    return isBattlePhase ? 'Battling…' : 'End Turn'
  }, [gameState, isBattlePhase, isGameOver])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Red</Text>
        <Text style={styles.headerText}>
          Turn {turn}/{NUMBER_OF_TURNS}
        </Text>
        <Text style={styles.headerText}>Blue</Text>
      </View>
      <View style={[styles.row, styles.topRow]}>{renderRow('top')}</View>
      <View style={[styles.row, styles.middleRow]}>{renderRow('middle')}</View>
      <View style={[styles.row, styles.bottomRow]}>{renderRow('bottom')}</View>
      <View style={styles.actions}>
        <View style={styles.handCards}>
          {handCards.map((card, cardIndex) => (
            <TouchableOpacity
              key={cardIndex}
              onPress={handleHandCardPress(cardIndex)}
              disabled={card.cost > energyLeft || isBattlePhase || isGameOver}
            >
              <HandCard
                card={card}
                isSelected={selectedCardIndex === cardIndex}
                isSelectable={card.cost <= energyLeft && !isBattlePhase && !isGameOver}
              />
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.turnInfo}>
          <View style={styles.energyLeft}>
            <Text style={styles.energyLeftText}>{energyLeft}</Text>
          </View>
          <View style={styles.endTurnButtonContainer}>
            <Button
              title={nextButtonTitle}
              color="fuchsia"
              onPress={handleEndTurn}
              disabled={isBattlePhase || isGameOver}
            />
          </View>
        </View>
      </View>
    </View>
  )
}
