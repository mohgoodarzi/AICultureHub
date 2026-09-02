import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
          <div class="policy-item">
            <div class="item-number">۱</div>
            <div class="item-content">
              <h3>حاکمیت</h3>
              <p>کلیه کاربردهای هوش مصنوعی باید تحت چارچوب حاکمیت، مسئولیت‌پذیری و نظارت مدیریت ارشد و کمیته حاکمیت AI انجام شود.</p>
            </div>
          </div>

          <div class="policy-item">
            <div class="item-number">۲</div>
            <div class="item-content">
              <h3>هم‌راستایی کسب‌وکار</h3>
              <p>استفاده از AI باید در راستای اهداف استراتژیک، افزایش بهره‌وری، کیفیت، نوآوری و تحول دیجیتال شرکت باشد.</p>
            </div>
          </div>

          <div class="policy-item">
            <div class="item-number">۳</div>
            <div class="item-content">
              <h3>اخلاق</h3>
              <p>استفاده از هوش مصنوعی باید منصفانه، شفاف، مسئولانه و بدون تبعیض و سوءاستفاده انجام شود.</p>
            </div>
          </div>

          <div class="policy-item">
            <div class="item-number">۴</div>
            <div class="item-content">
              <h3>نظارت انسانی و پاسخگویی</h3>
              <p>استفاده از هوش مصنوعی در <strong>تمامی واحدها و فرایندهای سازمانی</strong> باید با نظارت انسانی متناسب با سطح ریسک انجام شود و مسئولیت بررسی، اعتبارسنجی و تصمیم‌گیری نهایی بر عهده فرد یا واحد مسئول باشد.</p>
            </div>
          </div>

          <div class="policy-item">
            <div class="item-number">۵</div>
            <div class="item-content">
              <h3>امنیت</h3>
              <p>سامانه‌ها و خدمات AI باید مطابق الزامات امنیت سایبری، مدیریت دسترسی، ثبت رویداد و حفاظت در برابر تهدیدات و سوءاستفاده‌ها به‌کار گرفته شوند.</p>
            </div>
          </div>

          <div class="policy-item">
            <div class="item-number">۶</div>
            <div class="item-content">
              <h3>محرمانگی</h3>
              <p>اطلاعات محرمانه، فنی، قراردادی، مالی، پروژه‌ای و اطلاعات کارفرمایان نباید بدون مجوز در ابزارهای عمومی هوش مصنوعی وارد یا پردازش شوند.</p>
            </div>
          </div>

          <div class="policy-item">
            <div class="item-number">۷</div>
            <div class="item-content">
              <h3>حریم خصوصی</h3>
              <p>جمع‌آوری و پردازش اطلاعات کارکنان و سایر داده‌های شخصی باید با رعایت الزامات قانونی و اصول حفاظت از حریم خصوصی انجام شود.</p>
            </div>
          </div>

          <div class="policy-item">
            <div class="item-number">۸</div>
            <div class="item-content">
              <h3>صحت و قابلیت اعتماد</h3>
              <p>خروجی‌های AI باید متناسب با سطح ریسک، از نظر صحت، اعتبار، سوگیری و قابلیت اتکا بررسی و اعتبارسنجی شوند.</p>
            </div>
          </div>

          <div class="policy-item">
            <div class="item-number">۹</div>
            <div class="item-content">
              <h3>مدیریت ریسک</h3>
              <p>کلیه کاربردهای AI باید قبل و بعد از استقرار، از نظر ریسک‌های فنی، عملیاتی، امنیتی، حقوقی و اخلاقی ارزیابی و پایش شوند.</p>
            </div>
          </div>

          <div class="policy-item">
            <div class="item-number">۱۰</div>
            <div class="item-content">
              <h3>مالکیت فکری و قراردادها</h3>
              <p>استفاده از AI باید با رعایت حقوق مالکیت فکری، حقوق کارفرمایان، الزامات قراردادها و محدودیت‌های مربوط به داده و محتوا انجام شود.</p>
            </div>
          </div>

          <div class="policy-item">
            <div class="item-number">۱۱</div>
            <div class="item-content">
              <h3>فرهنگ و آموزش</h3>
              <p>شرکت متعهد به توسعه فرهنگ استفاده مسئولانه از AI و آموزش مستمر مدیران و کارکنان برای بهره‌برداری ایمن و مؤثر از آن است.</p>
            </div>
          </div>

          <div class="policy-item">
            <div class="item-number">۱۲</div>
            <div class="item-content">
              <h3>بهبود مستمر</h3>
              <p>کلیه سامانه‌ها و کاربردهای AI باید مستندسازی، پایش، ممیزی و به‌صورت دوره‌ای بازنگری شوند تا اثربخشی، امنیت و انطباق آن‌ها بهبود یابد.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
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
  `]
})
export class AiPolicyComponent {}
