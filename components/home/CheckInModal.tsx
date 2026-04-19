import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/lib/constants';
import type { HomeDashboardDto } from '@/src/features/home/types';

const RATING_OPTIONS = [
  ['😞', '😕', '😐', '🙂', '😄'],
  ['💤', '😴', '⚡', '🔋', '🚀'],
  ['😩', '😟', '😐', '😌', '🌟'],
] as const;

const RATING_LABELS = [
  ['Terrible', 'Bad', 'Okay', 'Good', 'Great'],
  ['Drained', 'Low', 'Moderate', 'Good', 'High'],
  ['Awful', 'Poor', 'Fair', 'Good', 'Amazing'],
] as const;

type Props = {
  visible: boolean;
  checkIn: HomeDashboardDto['checkIn'];
  onComplete: (answers: number[]) => Promise<void>;
  onClose: () => void;
};

export function CheckInModal({ visible, checkIn, onComplete, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    if (selected === null || saving) return;
    const nextAnswers = [...answers];
    nextAnswers[step] = selected + 1;
    setAnswers(nextAnswers);

    if (step < checkIn.questions.length - 1) {
      setStep(step + 1);
      setSelected(null);
      return;
    }

    setSaving(true);
    await onComplete(nextAnswers);
    setSaving(false);
    setDone(true);
    setTimeout(() => {
      setStep(0);
      setSelected(null);
      setAnswers([]);
      setDone(false);
      onClose();
    }, 1600);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={done ? undefined : onClose}>
        <Pressable onPress={() => {}}>
          <View className="bg-background rounded-t-3xl px-6 pt-5 pb-10">
            <View className="w-10 h-1 rounded-full bg-border self-center mb-5" />
            {done ? (
              <View className="items-center py-8 gap-4">
                <CheckCircle2 size={56} color={COLORS.green} />
                <Text className="text-foreground text-xl font-bold text-center">Check-in Complete!</Text>
                <View className="bg-seegla-green/15 px-4 py-2 rounded-full">
                  <Text className="text-seegla-green font-semibold">+{checkIn.pointsReward} pts earned</Text>
                </View>
              </View>
            ) : (
              <>
                <View className="flex-row items-center justify-center gap-2 mb-6">
                  {checkIn.questions.map((_, i) => (
                    <View
                      key={i}
                      className={
                        i === step
                          ? 'w-6 h-2 rounded-full bg-primary'
                          : i < step
                          ? 'w-2 h-2 rounded-full bg-primary/40'
                          : 'w-2 h-2 rounded-full bg-border'
                      }
                    />
                  ))}
                </View>
                <Text variant="muted" className="text-xs uppercase tracking-widest text-center mb-2">
                  Question {step + 1} of {checkIn.questions.length}
                </Text>
                <Text className="text-foreground text-xl font-bold text-center mb-7">
                  {checkIn.questions[step]}
                </Text>
                <View className="flex-row justify-between mb-3">
                  {RATING_OPTIONS[step].map((emoji, i) => (
                    <Pressable
                      key={i}
                      onPress={() => setSelected(i)}
                      className={`items-center gap-1.5 px-2 py-3 rounded-xl flex-1 mx-1 ${
                        selected === i ? 'bg-primary/10 border border-primary' : 'bg-card border border-border'
                      }`}
                    >
                      <Text className="text-2xl">{emoji}</Text>
                      <Text
                        className={`text-[10px] text-center ${
                          selected === i ? 'text-primary font-semibold' : 'text-muted-foreground'
                        }`}
                      >
                        {RATING_LABELS[step][i]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Button className="rounded-lg mt-4" disabled={selected === null || saving} onPress={handleNext}>
                  <Text>{step === checkIn.questions.length - 1 ? 'Submit Check-in' : 'Next'}</Text>
                </Button>
                <Pressable className="items-center mt-3 py-2" onPress={onClose}>
                  <Text variant="muted" className="text-sm">Skip for now</Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
