import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface PolicyItem {
  id?: number;
  displayOrder: number;
  title: string;
  text: string;
}

// Fallback content used only if the API is unreachable
const DEFAULT_POLICY: PolicyItem[] = [
  { displayOrder: 1, title: 'حاکمیت', text: 'کلیه کاربردهای هوش مصنوعی باید تحت چارچوب حاکمیت، مسئولیت‌پذیری و نظارت مدیریت ارشد و کمیته حاکمیت AI انجام شود.' },
  { displayOrder: 2, title: 'هم‌راستایی کسب‌وکار', text: 'استفاده از AI باید در راستای اهداف استراتژیک، افزایش بهره‌وری، کیفیت، نوآوری و تحول دیجیتال شرکت باشد.' },
  { displayOrder: 3, title: 'اخلاق', text: 'استفاده از هوش مصنوعی باید منصفانه، شفاف، مسئولانه و بدون تبعیض و سوءاستفاده انجام شود.' },
  { displayOrder: 4, title: 'نظارت انسانی و پاسخگویی', text: 'استفاده از هوش مصنوعی در تمامی واحدها و فرایندهای سازمانی باید با نظارت انسانی متناسب با سطح ریسک انجام شود و مسئولیت بررسی، اعتبارسنجی و تصمیم‌گیری نهایی بر عهده فرد یا واحد مسئول باشد.' },
  { displayOrder: 5, title: 'امنیت', text: 'سامانه‌ها و خدمات AI باید مطابق الزامات امنیت سایبری، مدیریت دسترسی، ثبت رویداد و حفاظت در برابر تهدیدات و سوءاستفاده‌ها به‌کار گرفته شوند.' },
  { displayOrder: 6, title: 'محرمانگی', text: 'اطلاعات محرمانه، فنی، قراردادی، مالی، پروژه‌ای و اطلاعات کارفرمایان نباید بدون مجوز در ابزارهای عمومی هوش مصنوعی وارد یا پردازش شوند.' },
  { displayOrder: 7, title: 'حریم خصوصی', text: 'جمع‌آوری و پردازش اطلاعات کارکنان و سایر داده‌های شخصی باید با رعایت الزامات قانونی و اصول حفاظت از حریم خصوصی انجام شود.' },
  { displayOrder: 8, title: 'صحت و قابلیت اعتماد', text: 'خروجی‌های AI باید متناسب با سطح ریسک، از نظر صحت، اعتبار، سوگیری و قابلیت اتکا بررسی و اعتبارسنجی شوند.' },
  { displayOrder: 9, title: 'مدیریت ریسک', text: 'کلیه کاربردهای AI باید قبل و بعد از استقرار، از نظر ریسک‌های فنی، عملیاتی، امنیتی، حقوقی و اخلاقی ارزیابی و پایش شوند.' },
  { displayOrder: 10, title: 'مالکیت فکری و قراردادها', text: 'استفاده از AI باید با رعایت حقوق مالکیت فکری، حقوق کارفرمایان، الزامات قراردادها و محدودیت‌های مربوط به داده و محتوا انجام شود.' },
  { displayOrder: 11, title: 'فرهنگ و آموزش', text: 'شرکت متعهد به توسعه فرهنگ استفاده مسئولانه از AI و آموزش مستمر مدیران و کارکنان برای بهره‌برداری ایمن و مؤثر از آن است.' },
  { displayOrder: 12, title: 'بهبود مستمر', text: 'کلیه سامانه‌ها و کاربردهای AI باید مستندسازی، پایش، ممیزی و به‌صورت دوره‌ای بازنگری شوند تا اثربخشی، امنیت و انطباق آن‌ها بهبود یابد.' }
];

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

function toPersianNumber(n: number): string {
  return String(n).split('').map(ch => ch >= '0' && ch <= '9' ? PERSIAN_DIGITS[+ch] : ch).join('');
}

@Component({
  selector: 'app-ai-policy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ai-policy-page">
      <div class="policy-container">
        <div class="policy-header">
          <span class="policy-chip">✦ چارچوب حاکمیت هوش مصنوعی</span>
          <img src="assets/logo.png" alt="شرکت طراحی و ساختمان نفت" class="header-logo">
          <h1>خلاصه ۱۲ خطی خط‌مشی هوش مصنوعی شرکت طراحی و ساختمان نفت</h1>
        </div>

        <div class="policy-content">
          <div class="policy-item" *ngFor="let item of policyItems; let i = index">
            <div class="item-number">{{ toPersianNumber(i + 1) }}</div>
            <div class="item-content">
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
            </div>
          </div>
          <div class="policy-empty" *ngIf="!policyItems.length">
            <p>محتوای خط‌مشی در حال بروزرسانی است.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .ai-policy-page {
      min-height: calc(100vh - 100px);
      padding: 20px 0;
      direction: rtl;
    }

    .policy-container {
      max-width: 900px;
      margin: 0 auto;
      background: var(--theme-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      border: 1px solid var(--theme-border);
      overflow: hidden;
      animation: fadeUp 0.6s var(--ease-smooth) both;
    }

    .policy-header {
      position: relative;
      padding: 40px 40px 34px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      color: #ffffff;
      overflow: hidden;
      background:
        radial-gradient(800px 300px at 90% -20%, rgba(255,255,255,0.18), transparent 60%),
        var(--gradient-brand);
      background-size: 200% 200%;
      animation: gradientShift 14s ease infinite;
    }

    .policy-header::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: radial-gradient(600px 300px at 50% 30%, #000 30%, transparent 78%);
      -webkit-mask-image: radial-gradient(600px 300px at 50% 30%, #000 30%, transparent 78%);
      animation: gridDrift 12s linear infinite;
      pointer-events: none;
    }

    .policy-chip {
      position: relative;
      display: inline-flex;
      padding: 7px 18px;
      border-radius: 100px;
      background: rgba(255,255,255,0.16);
      border: 1px solid rgba(255,255,255,0.3);
      backdrop-filter: blur(8px);
      font-size: 0.8rem;
      font-weight: 700;
    }

    .header-logo {
      width: 76px;
      height: 76px;
      object-fit: contain;
      filter: brightness(0) invert(1);
      opacity: 0.95;
      position: relative;
      animation: floatY 6s ease-in-out infinite;
    }

    .policy-header h1 {
      position: relative;
      margin: 0;
      color: #ffffff;
      font-size: 1.5rem;
      font-weight: 800;
      line-height: 1.7;
      letter-spacing: -0.02em;
    }

    .policy-content {
      padding: 30px 40px 36px;
    }

    .policy-item {
      display: flex;
      gap: 20px;
      padding: 22px 14px;
      border-bottom: 1px dashed var(--theme-border);
      border-radius: 14px;
      transition: all 0.3s var(--ease-smooth);
      position: relative;
    }

    .policy-item:last-child {
      border-bottom: none;
    }

    .policy-item:hover {
      background: color-mix(in srgb, var(--theme-primary) 4%, transparent);
      transform: translateX(-5px);
    }

    .item-number {
      flex-shrink: 0;
      width: 52px;
      height: 52px;
      background: var(--gradient-brand);
      color: white;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 1.2rem;
      box-shadow: 0 8px 20px color-mix(in srgb, var(--theme-primary) 30%, transparent);
      transition: all 0.3s var(--ease-spring);
    }

    .policy-item:hover .item-number {
      transform: scale(1.1) rotate(-6deg);
    }

    .item-content {
      flex: 1;
    }

    .item-content h3 {
      margin: 0 0 8px 0;
      color: var(--theme-text);
      font-size: 1.08rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .item-content p {
      margin: 0;
      color: var(--theme-text-secondary);
      font-size: 0.94rem;
      line-height: 2;
    }

    .item-content strong {
      color: var(--theme-primary);
      font-weight: 800;
    }

    @media (max-width: 768px) {
      .policy-header {
        padding: 28px 16px;
      }

      .header-logo {
        width: 56px;
        height: 56px;
      }

      .policy-header h1 {
        font-size: 1.1rem;
      }

      .policy-content {
        padding: 20px;
      }

      .policy-item {
        gap: 16px;
        padding: 16px 8px;
      }

      .item-number {
        width: 40px;
        height: 40px;
        font-size: 1rem;
        border-radius: 12px;
      }

      .item-content h3 {
        font-size: 1rem;
      }

      .item-content p {
        font-size: 0.9rem;
      }
    }

    @media (max-width: 480px) {
      .header-logo {
        width: 48px;
        height: 48px;
      }

      .policy-item {
        flex-direction: column;
        gap: 12px;
      }

      .item-number {
        width: 36px;
        height: 36px;
        font-size: 0.9rem;
      }
    }
  `
})
export class AiPolicyComponent implements OnInit {
  policyItems: PolicyItem[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<PolicyItem[]>(`${environment.apiUrl}/aipolicy`).subscribe({
      next: (items) => {
        this.policyItems = (items && items.length) ? items : DEFAULT_POLICY;
      },
      error: () => {
        // API unreachable — show the built-in fallback content
        this.policyItems = DEFAULT_POLICY;
      }
    });
  }

  toPersianNumber(n: number): string {
    return toPersianNumber(n);
  }
}
