/**
 * 날짜 포맷팅 함수 (YYYYMMDD -> YYYY.MM.DD)
 * @param dateString YYYYMMDD 형식의 날짜 문자열
 * @returns 포맷팅된 날짜 문자열 (YYYY.MM.DD)
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return "";

  try {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);

    return `${year}.${month}.${day}`;
  } catch {
    return dateString;
  }
};
