const WORD_PAIR_BANK: Record<string, string[]> = {
  en: [
    "Apple | Pear",
    "Doctor | Nurse",
    "Cat | Tiger",
    "Sun | Moon",
    "Coffee | Tea",
    "Guitar | Violin",
    "Beach | Pool",
    "Lion | Cheetah",
    "Pizza | Burger",
    "Train | Bus",
    "River | Lake",
    "King | Queen",
    "Winter | Autumn",
    "Shark | Dolphin",
    "Gold | Silver",
  ],
  vi: [
    "Táo | Lê",
    "Bác sĩ | Y tá",
    "Mèo | Hổ",
    "Mặt trời | Mặt trăng",
    "Cà phê | Trà",
    "Đàn guitar | Đàn violin",
    "Biển | Hồ bơi",
    "Sư tử | Báo",
    "Pizza | Burger",
    "Tàu hỏa | Xe buýt",
    "Sông | Hồ",
    "Vua | Hoàng hậu",
    "Mùa đông | Mùa thu",
    "Cá mập | Cá heo",
    "Vàng | Bạc",
  ],
  ko: [
    "사과 | 배",
    "의사 | 간호사",
    "고양이 | 호랑이",
    "태양 | 달",
    "커피 | 차",
    "기타 | 바이올린",
    "해변 | 수영장",
    "사자 | 치타",
    "피자 | 버거",
    "기차 | 버스",
    "강 | 호수",
    "왕 | 여왕",
    "겨울 | 가을",
    "상어 | 돌고래",
    "금 | 은",
  ],
};

const FALLBACK_LOCALE = "en";
const PAIRS_TO_PICK = 2;

export const generateWordPairs = (locale: string): string => {
  const bank = WORD_PAIR_BANK[locale] ?? WORD_PAIR_BANK[FALLBACK_LOCALE];
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, PAIRS_TO_PICK).join("\n");
};
