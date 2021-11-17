import { LessonTypeEmojis } from "@enums/LessonTypeEmojis";

export abstract class Utils {
    static bold(value: string): string {
        return "**" + value + "**";
    }

    static getEmojiFromLessonType(type: string): LessonTypeEmojis {
        switch (type) {
            case 'CM':
                return LessonTypeEmojis.CM;
            case 'TD':
                return LessonTypeEmojis.TD;
            case 'TP':
                return LessonTypeEmojis.TP;
            default:
                return LessonTypeEmojis.OTHER;
        }
    }
}
