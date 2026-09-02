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
      background: linear-gradient(135deg, var(--theme-surface) 0%, var(--theme-background) 100%);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      border: 1px solid var(--theme-border);
      overflow: hidden;
    }

    .policy-header {
      background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-primary-dark) 100%);
      padding: 28px 40px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .header-logo {
      width: 72px;
      height: 72px;
      object-fit: contain;
      filter: brightness(0) invert(1);
      opacity: 0.95;
    }

    .policy-header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1.6;
    }

    .policy-content {
      padding: 32px 40px;
    }

    .policy-item {
      display: flex;
      gap: 20px;
      padding: 20px 0;
      border-bottom: 1px solid var(--theme-border);
      transition: all 0.3s ease;
    }

    .policy-item:last-child {
      border-bottom: none;
    }

    .policy-item:hover {
      background: var(--theme-surface-hover);
      margin: 0 -20px;
      padding: 20px;
      border-radius: 12px;
    }

    .item-number {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark));
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.2rem;
      box-shadow: 0 4px 12px rgba(var(--theme-primary-rgb), 0.3);
    }

    .item-content {
      flex: 1;
    }

    .item-content h3 {
      margin: 0 0 8px 0;
      color: var(--theme-text);
      font-size: 1.1rem;
      font-weight: 600;
    }

    .item-content p {
      margin: 0;
      color: var(--theme-text-secondary);
      font-size: 0.95rem;
      line-height: 1.8;
    }

    .item-content strong {
      color: var(--theme-primary);
    }

    @media (max-width: 768px) {
      .policy-header {
        padding: 20px 16px;
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
        padding: 16px 0;
      }

      .item-number {
        width: 40px;
        height: 40px;
        font-size: 1rem;
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
