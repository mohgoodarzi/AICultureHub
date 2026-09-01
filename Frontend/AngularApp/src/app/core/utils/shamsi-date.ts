export class ShamsiDate {
  private static persianDays = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
  private static persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  private static persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  static toShamsi(date: Date | string): { year: number, month: number, day: number, dayName: string, monthName: string } {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    const gy = d.getFullYear();
    const gm = d.getMonth() + 1;
    const gd = d.getDate();

    const jy = gy - 621;
    
    const g2j = (year: number, month: number, day: number): number => {
      const a = Math.floor((14 - month) / 12);
      const y = year + 4800 - a;
      const m = month + 12 * a - 3;
      return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    };
    
    const isLeapJalali = (year: number): boolean => {
      return (((((year - 474) % 2820) + 474) * 682) % 2816) < 682;
    };
    
    const nowruzJdn = (year: number): number => {
      const knownNowruz: { [key: number]: number[] } = {
        1399: [2020, 3, 20], 1400: [2021, 3, 20], 1401: [2022, 3, 21],
        1402: [2023, 3, 21], 1403: [2024, 3, 19], 1404: [2025, 3, 20],
        1405: [2026, 3, 20], 1406: [2027, 3, 21], 1407: [2028, 3, 20],
        1408: [2029, 3, 21], 1409: [2030, 3, 20], 1410: [2031, 3, 21]
      };
      const nruz = knownNowruz[year] || [year + 621, 3, 20];
      return g2j(nruz[0], nruz[1], nruz[2]);
    };
    
    const jalaliNewYearJdn = nowruzJdn(jy);
    const todayJdn = g2j(gy, gm, gd);
    const dayOfYear = todayJdn - jalaliNewYearJdn;
    
    const months = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30];
    let jm = 1, jd = 1;
    
    if (dayOfYear < 0) {
      const prevYearJdn = nowruzJdn(jy - 1);
      const prevYearDays = isLeapJalali(jy - 1) ? 366 : 365;
      const daysInPrevYear = prevYearDays + dayOfYear;
      const prevMonths = isLeapJalali(jy - 1) ? [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29] : months;
      let remaining = daysInPrevYear;
      for (let i = 0; i < 12; i++) {
        if (remaining <= prevMonths[i]) {
          jm = i + 1;
          jd = remaining;
          break;
        }
        remaining -= prevMonths[i];
      }
    } else {
      let remaining = dayOfYear;
      for (let i = 0; i < 12; i++) {
        if (remaining <= months[i]) {
          jm = i + 1;
          jd = remaining;
          break;
        }
        remaining -= months[i];
      }
    }

    const dayOfWeek = d.getDay();
    const persianDayIndex = dayOfWeek;

    return {
      year: jy,
      month: jm,
      day: jd,
      dayName: this.persianDays[persianDayIndex],
      monthName: this.persianMonths[jm - 1]
    };
  }

  static format(date: Date | string, format: string = 'full'): string {
    const shamsi = this.toShamsi(date);

    switch (format) {
      case 'full':
        return `${shamsi.dayName}، ${shamsi.day} ${shamsi.monthName} ${shamsi.year}`;
      case 'short':
        return `${this.toPersianDigits(shamsi.year)}/${this.toPersianDigits(shamsi.month.toString().padStart(2, '0'))}/${this.toPersianDigits(shamsi.day.toString().padStart(2, '0'))}`;
      case 'date':
        return `${shamsi.day} ${shamsi.monthName} ${shamsi.year}`;
      case 'time':
        const d = typeof date === 'string' ? new Date(date) : date;
        return `${this.toPersianDigits(d.getHours().toString().padStart(2, '0'))}:${this.toPersianDigits(d.getMinutes().toString().padStart(2, '0'))}`;
      case 'datetime':
        return `${this.format(date, 'date')} - ${this.format(date, 'time')}`;
      default:
        return `${shamsi.year}/${shamsi.month}/${shamsi.day}`;
    }
  }

  static toPersianDigits(num: string | number): string {
    return num.toString().replace(/\d/g, (d: string) => this.persianDigits[parseInt(d)]);
  }

  static getToday(): string {
    return this.format(new Date(), 'full');
  }
}
