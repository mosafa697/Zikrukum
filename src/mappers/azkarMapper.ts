import type { ComponentProps } from 'react';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import azkarData from '../dataset/azkar-sample.json';

type FontAwesome5Name = ComponentProps<typeof FontAwesome5>['name'];

const CATEGORY_ICON_MAP: Record<number, string> = {
  1: 'shield-alt', // الرقية الشرعية — shield
  2: 'hand-holding-heart', // الاستغفار و التوبة — repentance/heart
  3: 'sun', // أذكار الصباح — sun
  4: 'moon', // أذكار المساء — moon
  5: 'bed', // أذكار النوم — bed
  6: 'cloud-sun', // أذكار الاستيقاظ من النوم — sunrise/wakeup
  7: 'pray', // الأذكار بعد السلام من الصلاة — praying
  8: 'door-open', // دعاء الاستفتاح — opening
  9: 'level-down-alt', // دعاء الركوع — bowing down
  10: 'level-up-alt', // دعاء الرفع من الركوع — rising up
  11: 'angle-double-down', // دعاء السجود — prostration
  12: 'praying-hands', // دعاء صلاة الاستخارة — seeking guidance/shuffle
  13: 'pray', // دعاء قنوت الوتر — flame/candle
  14: 'mountain', // دعاء يوم عَرَفَة — mountain (Arafat)
  15: 'cloud-rain', // دعاء الهم والحزن — grief/rain
  16: 'life-ring', // دعاء الكرب — distress/lifesaver
  17: 'stethoscope', // الدعاء للمريض في عيادته — sick/doctor
  18: 'eye-slash', // الدعاء عند إغماض الميت — closing eyes
  19: 'hands', // الدعاء للميت في الصلاة عليه — prayer hands
  20: 'hands', // الدعاء عند إدخال الميت القبر — burial
  21: 'hands', // الدعاء بعد دفن الميت — flower/seedling
  22: 'calendar-alt', // سنن يوم الجمعة — Friday calendar
  122: 'kaaba', // دعاء يوم عَرَفَة — kaaba/hajj
};

export type AzkarPhrase = {
  id: number;
  text: string;
  count: number;
  subtext: string;
  audio?: string;
  filename?: string;
};

export type AzkarCategory = {
  id: number;
  title: string;
  icon: FontAwesome5Name;
  phrases: AzkarPhrase[];
  audioRef?: { audio: string; filename: string };
};

export const azkar: AzkarCategory[] = (
  azkarData as {
    filename: any;
    audio: any;
    id: number;
    category: string;
    array: {
      id: number; 
      text: string; 
      count: number; 
      subtext: string 
      audio: string;
      filename: string;
}[];
  }[]
).map((category) => ({
  id: category.id,
  title: category.category,
  icon: CATEGORY_ICON_MAP[category.id] ?? 'albums-outline',
  phrases: category.array.map((phrase) => ({
    id: phrase.id,
    text: phrase.text,
    count: phrase.count,
    subtext: phrase.subtext,
    audio: phrase.audio,
    filename: phrase.filename,
  })),
  audioRef:
    category.audio || category.filename
      ? { audio: category.audio ?? '', filename: category.filename ?? '' }
      : undefined,
}));
