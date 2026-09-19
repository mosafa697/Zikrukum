import type { ComponentProps } from 'react';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import azkarData from '../dataset/azkar.json';
// import azkarData from '../dataset/azkar-sample.json';

type FontAwesome5Name = ComponentProps<typeof FontAwesome5>['name'];

const CATEGORY_ICON_MAP: Record<number, string> = {
  1: 'shield-alt', // الرقية الشرعية
  2: 'hand-holding-heart', // الاستغفار و التوبة
  3: 'sun', // أذكار الصباح
  4: 'moon', // أذكار المساء
  5: 'bed', // أذكار النوم
  6: 'cloud-sun', // أذكار الاستيقاظ من النوم
  7: 'pray', // الأذكار بعد السلام من الصلاة
  8: 'door-open', // دعاء الاستفتاح
  9: 'level-down-alt', // دعاء الركوع
  10: 'level-up-alt', // دعاء الرفع من الركوع
  11: 'angle-double-down', // دعاء السجود
  12: 'praying-hands', // دعاء صلاة الاستخارة
  13: 'pray', // دعاء قنوت الوتر
  14: 'cloud-rain', // دعاء الهم والحزن
  15: 'life-ring', // دعاء الكرب
  16: 'stethoscope', // الدعاء للمريض في عيادته
  17: 'eye-slash', // الدعاء عند إغماض الميت
  18: 'hands', // الدعاء للميت في الصلاة عليه
  19: 'hands', // الدعاء عند إدخال الميت القبر
  20: 'seedling', // الدعاء بعد دفن الميت
  21: 'calendar-alt', // سنن يوم الجمعة
  22: 'pray', // دعاء الجلسة بين السجدتين
  23: 'book-open', // دعاء سجود التلاوة
  24: 'hands', // التشهد
  25: 'star-and-crescent', // الصلاة على النبي بعد التشهد
  26: 'pray', // الدعاء بعد التشهد الأخير قبل السلام
  29: 'moon', // الدعاء إذا تقلب ليلا
  30: 'bed', // دعاء الفزع في النوم و من بُلِيَ بالوحشة
  31: 'eye', // ما يفعل من رأى الرؤيا أو الحلم
  33: 'pray', // الذكر عقب السلام من الوتر
  36: 'shield-alt', // دعاء لقاء العدو و ذي السلطان
  37: 'gavel', // دعاء من خاف ظلم السلطان
  38: 'bolt', // الدعاء على العدو
  39: 'user-shield', // ما يقول من خاف قوما
  40: 'brain', // دعاء من أصابه وسوسة في الإيمان
  41: 'hand-holding-usd', // دعاء قضاء الدين
  42: 'comment-slash', // دعاء الوسوسة في الصلاة و القراءة
  43: 'mountain', // دعاء من استصعب عليه أمر
  44: 'hand-holding-heart', // ما يقول ويفعل من أذنب ذنبا
  45: 'wind', // دعاء طرد الشيطان و وساوسه
  46: 'balance-scale', // الدعاء حينما يقع ما لا يرضاه أو غُلب على أمره
  47: 'baby', // تهنئة المولود له وجوابه
  48: 'child', // ما يعوذ به الأولاد
  50: 'hospital', // فضل عيادة المريض
  51: 'heartbeat', // دعاء المريض الذي يئس من حياته
  52: 'dove', // تلقين المحتضر
  53: 'heart-broken', // دعاء من أصيب بمصيبة
  56: 'hands', // الدعاء للفرط في الصلاة عليه
  57: 'comment-dots', // دعاء التعزية
  60: 'hands', // دعاء زيارة القبور
  61: 'wind', // دعاء الريح
  62: 'bolt', // دعاء الرعد
  63: 'cloud-rain', // من أدعية الاستسقاء
  64: 'umbrella', // الدعاء إذا نزل المطر
  65: 'cloud-sun', // الذكر بعد نزول المطر
  66: 'sun', // من أدعية الاستصحاء
  67: 'moon', // دعاء رؤية الهلال
  68: 'utensils', // الدعاء عند إفطار الصائم
  69: 'utensils', // الدعاء قبل الطعام
  70: 'utensils', // الدعاء عند الفراغ من الطعام
  71: 'home', // دعاء الضيف لصاحب الطعام
  72: 'utensils', // التعريض بالدعاء لطلب الطعام أو الشراب
  73: 'home', // الدعاء إذا أفطر عند أهل بيت
  74: 'utensils', // دعاء الصائم إذا حضر الطعام ولم يفطر
  75: 'comment-slash', // ما يقول الصائم إذا سابه أحد
  76: 'apple-alt', // الدعاء عند رؤية باكورة الثمر
  77: 'wind', // دعاء العطاس
  78: 'comment', // ما يقال للكافر إذا عطس فحمد الله
  79: 'heart', // الدعاء للمتزوج
  80: 'horse', // دعاء المتزوج و شراء الدابة
  81: 'bed', // الدعاء قبل إتيان الزوجة
  82: 'angry', // دعاء الغضب
  83: 'eye', // دعاء من رأى مبتلى
  84: 'comments', // ما يقال في المجلس
  85: 'comment-dots', // كفارة المجلس
  86: 'thumbs-up', // الدعاء لمن قال غفر الله لك
  87: 'gift', // الدعاء لمن صنع إليك معروفا
  88: 'shield-alt', // ما يعصم الله به من الدجال
  89: 'heart', // الدعاء لمن قال إني أحبك في الله
  90: 'wallet', // الدعاء لمن عرض عليك ماله
  91: 'hand-holding-usd', // الدعاء لمن أقرض عند القضاء
  92: 'exclamation-triangle', // دعاء الخوف من الشرك
  93: 'smile', // الدعاء لمن قال بارك الله فيك
  94: 'feather', // دعاء كراهية الطيرة
  95: 'car', // دعاء الركوب
  96: 'plane', // دعاء السفر
  97: 'city', // دعاء دخول القرية أو البلدة
  98: 'shopping-cart', // دعاء دخول السوق
  99: 'car-crash', // الدعاء إذا تعس المركوب
  100: 'plane-departure', // دعاء المسافر للمقيم
  101: 'plane-arrival', // دعاء المقيم للمسافر
  102: 'route', // التكبير و التسبيح في سير السفر
  103: 'moon', // دعاء المسافر إذا أسحر
  104: 'home', // الدعاء إذا نزل مترلا في سفر أو غيره
  105: 'home', // ذكر الرجوع من السفر
  106: 'laugh', // ما يقول من أتاه أمر يسره أو يكرهه
  107: 'award', // فضل الصلاة على النبي صلى الله عليه و سلم
  108: 'handshake', // إفشاء السلام
  109: 'comment', // كيف يرد السلام على الكافر إذا سلم
  110: 'bullhorn', // الدُّعاءُ عِنْدَ سَمَاعِ صِياحِ الدِّيكِ ونَهِيقِ الْحِمَارِ
  111: 'moon', // دعاء نباح الكلاب بالليل
  112: 'comment-slash', // الدعاء لمن سببته
  113: 'thumbs-up', // ما يقول المسلم إذا مدح المسلم
  114: 'medal', // ما يقول المسلم إذا زكي
  115: 'kaaba', // كيف يلبي المحرم في الحج أو العمرة ؟
  116: 'kaaba', // التكبير إذا أتى الركن الأسود
  117: 'compass', // الدعاء بين الركن اليماني والحجر الأسود
  118: 'mountain', // دعاء الوقوف على الصفا والمروة
  119: 'mountain', // الدعاء يوم عرفة
  120: 'mosque', // الذكر عند المشعر الحرام
  121: 'bullseye', // التكبير عند رمي الجمار مع كل حصاة
  122: 'gift', // ما يفعل من أتاه أمر يسره
  123: 'stethoscope', // ما يقول من أحس وجعا في جسده
  124: 'eye', // دعاء من خشي أن يصيب شيئا بعينه
  125: 'surprise', // دعاء التعجب والأمر السار
  126: 'bed', // ما يقال عند الفزع
  127: 'utensil-spoon', // ما يقول عند الذبح أو النحر
  128: 'shield-alt', // ما يقول لرد كيد مردة الشياطين
  130: 'trophy', // فضل التسبيح و التحميد، و التهليل، و التكبير
  131: 'hand-pointer', // كيف كان النبي يسبح؟
  132: 'book-open', // من أنواع الخير والآداب الجامعة
  133: 'bed', // ما يقول إذا وضع ثوبه
  134: 'door-closed', // دعاء دخول الخلاء
  135: 'door-open', // دعاء الخروج من الخلاء
  136: 'tint', // الذكر قبل الوضوء
  137: 'hands', // الذكر بعد الفراغ من الوضوء
  138: 'walking', // الذكر عند الخروج من المنزل
  139: 'home', // الذكر عند دخول المنزل
  140: 'mosque', // دعاء الذهاب إلى المسجد
  141: 'door-open', // دعاء دخول المسجد
  142: 'door-closed', // دعاء الخروج من المسجد
  143: 'bullhorn', // أذكار الآذان
  144: 'tshirt', // دعاء لُبْس الثوب
  145: 'gift', // دعاء لُبْس الثوب الجديد
  146: 'thumbs-up', // الدعاء لمن لبس ثوبا جديدا
};

export type AzkarPhrase = {
  id: number;
  text: string;
  count: number;
  subtext: string;
  filename?: string;
};

export type AzkarCategory = {
  id: number;
  title: string;
  icon: FontAwesome5Name;
  phrases: AzkarPhrase[];
};

export const azkar: AzkarCategory[] = (
  azkarData as {
    id: number;
    category: string;
    array: {
      id: number;
      text: string;
      count: number;
      subtext: string;
      filename: string;
    }[];
  }[]
).map((category) => ({
  id: category.id,
  title: category.category,
  icon: CATEGORY_ICON_MAP[category.id] ?? 'bookmark',
  phrases: category.array.map((phrase) => ({
    id: phrase.id,
    text: phrase.text,
    count: phrase.count,
    subtext: phrase.subtext ?? '',
    filename: phrase.filename,
  })),
}));
