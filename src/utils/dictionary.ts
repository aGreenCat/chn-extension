import cedict from "../assets/cedict.json";

type WordItem = {
    trad: string,
    simp: string,
    pinyin: string,
    // etc
}

export const dictionary = ( word : string ): WordItem | null => {
    return null;
}