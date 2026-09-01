using AICultureHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AICultureHub.Infrastructure.Data
{
    public static class SeedSampleData
    {
        public static void Seed(this ApplicationDbContext context)
        {
            // Check if data already exists
            if (context.Articles.Any() || context.Courses.Any())
            {
                Console.WriteLine("Sample data already exists.");
                return;
            }

            // Get or create categories
            var techCategory = context.Categories.FirstOrDefault(c => c.Name.Contains("เทคโนโลยี") || c.Name == "Tech");
            if (techCategory == null)
            {
                techCategory = new Category { Name = "เทคโนโลยี", Slug = "tech", Description = "เทคโนโลยีและการดิจิทัล", IsActive = true };
                context.Categories.Add(techCategory);
                context.SaveChanges();
            }

            // Add more categories
            var designCategory = context.Categories.FirstOrDefault(c => c.Name == "ดีไซน์" || c.Slug == "design");
            if (designCategory == null)
            {
                designCategory = new Category { Name = "ดีไซน์", Slug = "design", Description = "การออกแบบและ UX/UI", IsActive = true };
                context.Categories.Add(designCategory);
                context.SaveChanges();
            }

            var marketingCategory = context.Categories.FirstOrDefault(c => c.Name == "การตลาด" || c.Slug == "marketing");
            if (marketingCategory == null)
            {
                marketingCategory = new Category { Name = "การตลาด", Slug = "marketing", Description = "กลยุทธ์และเทคนิคการตลาดดิจิทัล", IsActive = true };
                context.Categories.Add(marketingCategory);
                context.SaveChanges();
            }

            var dataScienceCategory = context.Categories.FirstOrDefault(c => c.Name == "วิทยาศาสตร์ข้อมูล" || c.Slug == "data-science");
            if (dataScienceCategory == null)
            {
                dataScienceCategory = new Category { Name = "วิทยาศาสตร์ข้อมูล", Slug = "data-science", Description = "การวิเคราะห์และประมวลผลข้อมูล", IsActive = true };
                context.Categories.Add(dataScienceCategory);
                context.SaveChanges();
            }

            // Create sample articles about AI
            var articles = new List<Article>
            {
                new Article
                {
                    Title = "ปัญญาประดิษฐ์เปลี่ยนโลก: โอกาสและความท้าทาย",
                    Slug = "ai-changing-world",
                    Summary = "การปฏิรูปทางเทคโนโลยีที่สำคัญที่สุดในศวรรษนี้",
                    Content = "ปัญญาประดิษฐ์ (AI) ได้กลายเป็นหัวใจสำคัญของนวัตกรรมทางเทคโนโลยีในปัจจุบัน จากรถยนต์ขับขับอัตโนมัติไปจนถึงระบบสุขภาพอัจฉริยะ AI กำลังปฏิรูปทุกอุद्योग โอกาสมีมากมาย แต่ก็ยังมีความท้าทายด้านจริยธรรม ความเป็นส่วนตัวของข้อมูล และการสูญเสียนงานที่ต้องได้รับการจัดการ",
                    ImageUrl = "/images/ai-transformation.jpg",
                    CategoryId = techCategory.Id,
                    AuthorId = 1,
                    ReadingTimeMinutes = 8,
                    ViewCount = 0,
                    LikeCount = 0,
                    IsPublished = true,
                    IsFeatured = true,
                    PublishedDate = DateTime.UtcNow,
                    Difficulty = "Intermediate"
                },
                new Article
                {
                    Title = "ทำความเข้าใจ Generative AI: จาก Concept ถึง การใช้งานจริง",
                    Slug = "generative-ai-explained",
                    Summary = "คำแนะนำ complete เกี่ยวกับ AI ที่สร้างสรรค์และโมเดล Language Model",
                    Content = "Generative AI หรือ AI ที่สร้างสรรค์ ได้ปฏิรูปวิธีที่เราสร้างเนื้อหาโค้ดและแก้ปัญหา ตั้งแต่ ChatGPT จนถึง DALL-E เทคโนโลยีเหล่านี้ใช้ deep learning เพื่อสร้างข้อมูลใหม่ที่คล้ายกับข้อมูลที่ฝึกสอน โมเดล Language Model เช่น GPT-4 สามารถเขียนโค้ด ตอบคำถาม และช่วยในงานสร้างสรรค์ได้อย่างมีประสิทธิภาพ",
                    ImageUrl = "/images/generative-ai.jpg",
                    CategoryId = techCategory.Id,
                    AuthorId = 1,
                    ReadingTimeMinutes = 12,
                    ViewCount = 0,
                    LikeCount = 0,
                    IsPublished = true,
                    IsFeatured = true,
                    PublishedDate = DateTime.UtcNow,
                    Difficulty = "Beginner"
                },
                new Article
                {
                    Title = "AI ในที่ทำงาน: เพิประสิทธิภาพให้กับทีมของคุณ",
                    Slug = "ai-workplace-productivity",
                    Summary = "วิธีการใช้ AI เพื่อเพิ่มประสิทธิภาพในงานประจำวัน",
                    Content = "AI สามารถช่วยเพิ่มประสิทธิภาพในที่ทำงานได้หลายวิธี เช่น การอัตโนมัติงานซ้ำซ้อน การวิเคราะห์ข้อมูล และการช่วยเหลือการตัดสินใจ โดยการใช้ AI Tools เช่น ตัวช่วยเขียนโค้ดและระบบอัตโนมัติ ทีมงานสามารถใช้เวลาไปกับงานเชิงกลยุทธ์และสร้างสรรค์มากขึ้น การรับ AI ไปพร้อมกันต้องการการฝึกอบรมและการปรับเปลี่ยนวัฒนธรรมองค์กร",
                    ImageUrl = "/images/ai-workplace.jpg",
                    CategoryId = techCategory.Id,
                    AuthorId = 1,
                    ReadingTimeMinutes = 6,
                    ViewCount = 0,
                    LikeCount = 0,
                    IsPublished = true,
                    Difficulty = "Intermediate"
                },
                new Article
                {
                    Title = "ดิจิทัลทรานส์ฟอร์มเมอร์: ภาพรวมแบบ entire",
                    Slug = "digital-transformation-overview",
                    Summary = "คำแนะนำแบบ entire เกี่ยวกับการเปลี่ยนแปลงดิจิทัลสำหรับองค์กร",
                    Content = "ดิจิทัลทรานส์ฟอร์มเมอร์ไม่ได้หมายถึงแค่การนำเทคโนโลยีใหม่มาใช้ แต่เป็นกระบวนการเปลี่ยนแปลงพื้นฐานวิธีที่องค์กรทำงานและมอบคุณค่าให้กับลูกค้า มันรวมถึงการเปลี่ยนวัฒนธรรม กระบวนการทำงาน และโมเดลธุรกิจ การประสบความสำเร็จต้องมีการวางแผน การลงทุนเทคโนโลยี และการรับเปลี่ยนจากพนักงานทุกระดับ",
                    ImageUrl = "/images/digital-transformation.jpg",
                    CategoryId = techCategory.Id,
                    AuthorId = 1,
                    ReadingTimeMinutes = 10,
                    ViewCount = 0,
                    LikeCount = 0,
                    IsPublished = true,
                    Difficulty = "Advanced"
                },
                new Article
                {
                    Title = "อนาคตของ AI: เทรนด์ที่ควรจับตามองในปี 2024",
                    Slug = "future-ai-trends-2024",
                    Summary = "การคาดการณ์เทรนด์ปัญญาประดิษฐ์รุ่นใหม่",
                    Content = "ในปี 2024 เราคาดว่าจะเห็นความก้าวหน้าที่สำคัญในหลายด้าน รวมถึง AI รุ่นหลายโหมด (Multimodal AI) ที่สามารถประมวลผลข้อความ รูปภาพ และเสียงพร้อมกัน การพัฒนาด้าน AI ที่มีจริยธรรม การเพิ่มประสิทธิภาพด้านพลังงาน และการใช้ AI ในอุद्योगเฉพาะทาง เช่น ยาและการเงิน การจับตาดูเทรนด์เหล่านี้จะช่วยให้องค์กรและบุคคลเตรียมพร้อมสำหรับอนาคต",
                    ImageUrl = "/images/future-ai.jpg",
                    CategoryId = techCategory.Id,
                    AuthorId = 1,
                    ReadingTimeMinutes = 7,
                    ViewCount = 0,
                    LikeCount = 0,
                    IsPublished = true,
                    Difficulty = "Intermediate"
                }
            };

            // Add articles to context
            foreach (var article in articles)
            {
                context.Articles.Add(article);
            }
            context.SaveChanges();

            // Create sample courses
            var courses = new List<Course>
            {
                new Course
                {
                    Title = "ปัญญาประดิษฐ์สำหรับผู้เริ่มต้น",
                    Slug = "ai-basics",
                    Description = "หลักสูตรแนะนำพื้นฐานสำหรับผู้ที่ต้องการเรียนรู้เกี่ยวกับปัญญาประดิษฐ์",
                    ShortDescription = "เรียนรู้พื้นฐาน AI อันดับแรก",
                    ThumbnailUrl = "/courses/ai-thumbnail.jpg",
                    Difficulty = "Beginner",
                    EstimatedDurationMinutes = 60,
                    Points = 100,
                    CategoryId = techCategory.Id,
                    IsPublished = true,
                    IsFeatured = true,
                    DisplayOrder = 1
                },
                new Course
                {
                    Title = "Generative AI and Large Language Models",
                    Slug = "generative-ai-llm",
                    Description = "เรียนรู้เกี่ยวกับ AI ที่สร้างสรรค์และโมเดล Language Model ขั้นสูง",
                    ShortDescription = " deep dive เข้าสู่โลก Generative AI",
                    ThumbnailUrl = "/courses/gen-ai.jpg",
                    Difficulty = "Advanced",
                    EstimatedDurationMinutes = 120,
                    Points = 200,
                    CategoryId = techCategory.Id,
                    IsPublished = true,
                    IsFeatured = true,
                    DisplayOrder = 2
                },
                new Course
                {
                    Title = "AI ในที่ทำงาน",
                    Slug = "ai-workplace",
                    Description = "การนำ AI ไปใช้จริงเพื่อเพิ่มประสิทธิภาพในองค์กร",
                    ShortDescription = "วิธีการนำ AI ไปใช้จริง",
                    ThumbnailUrl = "/courses/ai-workplace.jpg",
                    Difficulty = "Intermediate",
                    EstimatedDurationMinutes = 90,
                    Points = 150,
                    CategoryId = techCategory.Id,
                    IsPublished = true,
                    DisplayOrder = 3
                },
                new Course
                {
                    Title = "ดิจิทัลทรานส์ฟอร์มเมอร์",
                    Slug = "digital-transformation",
                    Description = "หลักสูตร entire เกี่ยวกับการเปลี่ยนแปลงดิจิทัลสำหรับผู้นำองค์กร",
                    ShortDescription = "แนวทางแบบ entire ในการเปลี่ยนแปลงดิจิทัล",
                    ThumbnailUrl = "/courses/dt-overview.jpg",
                    Difficulty = "Advanced",
                    EstimatedDurationMinutes = 180,
                    Points = 300,
                    CategoryId = techCategory.Id,
                    IsPublished = true,
                    DisplayOrder = 4
                },
                new Course
                {
                    Title = "AI Tools สำหรับนักพัฒนา",
                    Slug = "ai-tools-developers",
                    Description = "เครื่องมือและเทคโนโลยี AI ที่นักพัฒนาควรรู้จัก",
                    ShortDescription = "เรียนรู้ AI Tools ที่จำเป็น",
                    ThumbnailUrl = "/courses/ai-tools.jpg",
                    Difficulty = "Intermediate",
                    EstimatedDurationMinutes = 45,
                    Points = 80,
                    CategoryId = techCategory.Id,
                    IsPublished = true,
                    DisplayOrder = 5
                }
            };

            foreach (var course in courses)
            {
                context.Courses.Add(course);
            }
            context.SaveChanges();

            Console.WriteLine($"Seed data added: {articles.Count} articles and {courses.Count} courses.");
        }
    }
}