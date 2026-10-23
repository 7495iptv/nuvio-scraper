// 1. ฟังก์ชันแกะลิงก์ ok.ru (Scraper)
async function extractOkRuStream(embedUrl) {
    try {
        // ใช้ Proxy เพื่อแก้ CORS ชั่วคราวตอนทดสอบบนคอม (ถ้าทดสอบผ่าน Proxy)
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const response = await fetch(proxyUrl + encodeURIComponent(embedUrl));
        const html = await response.text();
        
        const match = html.match(/data-options="([^"]+)"/);
        if (!match) throw new Error("ไม่พบข้อมูลสตรีม");

        const options = JSON.parse(match[1].replace(/&quot;/g, '"'));
        
        // --- ส่วนที่แก้ไข ---
        let metadata = options.flashvars.metadata;
        // เช็คว่าถ้ายังเป็นข้อความ (String) ค่อยแปลงเป็น JSON
        if (typeof metadata === 'string') {
            metadata = JSON.parse(metadata);
        }
        // -----------------
        
        return metadata.videos; 
    } catch (error) {
        console.error("Scraper Error:", error);
        return null;
    }
}

// 2. ปรับปรุงฟังก์ชัน onclick ใน renderCatalog
function renderCatalog(items) {
    const catalogContainer = document.getElementById('catalog');
    
    items.forEach(item => {
        // ... (โค้ดสร้างกล่องการ์ด ภาพปก และชื่อเรื่อง คงเดิม) ...
        
        card.onclick = async () => {
            console.log(`กำลังประมวลผล: ${item.title}`);
            console.log(`กำลังแกะลิงก์จาก: ${item.video_url}`);
            
            // เรียกใช้ Scraper เมื่อผู้ใช้คลิก
            const streams = await extractOkRuStream(item.video_url);
            
            if (streams && streams.length > 0) {
                // ปกติวิดีโอมักจะเรียงจากความละเอียดต่ำไปสูง (mobile, sd, hd)
                // สมมติว่าเราดึงความละเอียดสูงสุดมาใช้งาน
                const bestQuality = streams[streams.length - 1]; 
                
                console.log(`แกะลิงก์สำเร็จ! ความละเอียด: ${bestQuality.name}`);
                console.log(`Direct Link: ${bestQuality.url}`);
                
                // === จุดเชื่อมต่อกับ Nuvio หรือ Player ===
                // หากทำระบบส่งให้ Nuvio จะต้องใช้ API ของแอป เช่น Nuvio.playVideo(bestQuality.url)
                // หรือหากทดสอบบนคอมพิวเตอร์ สามารถสั่งเปิดวิดีโอแท็บใหม่ได้แบบนี้:
                // window.open(bestQuality.url, '_blank');
            } else {
                alert("ไม่สามารถดึงข้อมูลวิดีโอได้ในขณะนี้");
            }
        };
        
        // ... (โค้ด appendChild คงเดิม) ...
    });
}