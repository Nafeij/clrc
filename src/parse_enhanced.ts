import {
  EnhancedLyricLine,
  InvalidLine,
  LineType,
  MetadataLine,
  EnhancedWord,
} from './constants';
import parse from './parse';
import { timestampToMillsecond } from './utils';

/**
 * <00:00.000>
 * <00:00.00>
 * <00:00>
 */
const ENHANCED_TIME = /<\d{2,}:\d{2}(?:\.(?:\d{2,3}))?>/g;

function parseEnhanced<MetadataKey extends string>(
  lrc: string
): (InvalidLine | MetadataLine<MetadataKey> | EnhancedLyricLine)[] {
  const lines = parse<MetadataKey>(lrc);
  return lines.map((line) => {
    if (line.type === LineType.LYRIC) {
      const words: EnhancedWord[] = [];

      const wordTimeTagMatch = line.content.match(ENHANCED_TIME);

      if (!wordTimeTagMatch) {
        /**
         * no time tag but having content is invalid
         * like [time] xxxxx
         * @author mebtte<hi@mebtte.com>
         */
        if (line.content.trim().length) {
          return {
            type: LineType.INVALID,
            lineNumber: line.lineNumber,
            raw: line.raw,
          } as InvalidLine;
        }
      } else {
        const wordContents = line.content.split(ENHANCED_TIME);

        /**
         * ignore first emptiness or only-space
         * @author mebtte<hi@mebtte.com>
         */
        if (wordContents[0].trim().length === 0) {
          wordContents.shift();
        }

        /**
         * time tag' length should equal to content's length
         * @author mebtte<hi@mebtte.com>
         */
        if (wordTimeTagMatch.length !== wordContents.length) {
          return {
            type: LineType.INVALID,
            lineNumber: line.lineNumber,
            raw: line.raw,
          } as InvalidLine;
        }

        for (let i = 0; i < wordTimeTagMatch.length; i += 1) {
          const timestamp = wordTimeTagMatch[i];
          const content = wordContents[i];
          words.push({
            index: i,
            raw: `${timestamp}${content}`,
            startMillisecond: timestampToMillsecond(
              timestamp.replace(/[<>]/g, '')
            ),
            content,
          });
        }
      }

      return {
        ...line,
        type: LineType.ENHANCED_LYRIC,
        words,
      };
    }

    return line;
  });
}

export default parseEnhanced;
