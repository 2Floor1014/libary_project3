const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// 1. 連線到 SQLite 資料庫並自動初始化資料
// ==========================================
const dbPath = path.join(__dirname, 'libary.db'); 
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('資料庫連線失敗：', err.message);
    } else {
        console.log('成功連線到 SQLite 資料庫！');
        initializeDatabase(); 
    }
});

// 自動清理舊資料並重設的函式
function initializeDatabase() {
    db.serialize(() => {
        console.log('正在清理舊資料並重建資料表...');
        
        db.run('DROP TABLE IF EXISTS borrow_records');
        db.run('DROP TABLE IF EXISTS books');

        db.run(`
            CREATE TABLE books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                genre TEXT NOT NULL,
                author TEXT
            )
        `);

        db.run(`
            CREATE TABLE borrow_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                book_id INTEGER NOT NULL,
                borrower_name TEXT NOT NULL,
                borrow_date DATE NOT NULL,
                FOREIGN KEY (book_id) REFERENCES books(id)
            )
        `);

        // 匯入書籍種子資料
        const booksStmt = db.prepare('INSERT INTO books (title, genre, author) VALUES (?, ?, ?)');
        const booksData = [
            ['解憂雜貨店', '小說', '東野圭吾'], ['挪威的森林', '小說', '村上春樹'], ['哈利波特', '小說', 'J.K. 羅琳'], ['魔戒', '小說', '托爾金'], ['百年孤寂', '小說', '馬奎斯'],
            ['追風箏的孩子', '小說', '卡勒德·胡賽尼'], ['1984', '小說', '喬治·歐威爾'], ['白鯨記', '小說', '赫爾曼'], ['大亨小傳', '小說', '費茲傑羅'], ['傲慢與偏見', '小說', '珍·奧斯汀'],
            ['時間簡史', '科普', '史蒂芬·霍金'], ['人類大歷史', '科普', '哈拉瑞'], ['自私的基因', '科普', '理查·道金斯'], ['萬物簡史', '科普', '比爾·布萊森'], ['宇宙的琴弦', '科普', '布萊恩·葛林'],
            ['快思慢想', '科普', '康納曼'], ['改變世界的方程式', '科普', '米丘·加來'], ['大腦簡史', '科普', '謝伯讓'], ['基因密碼', '科普', '華生'], ['費曼物理學講義', '科普', '費曼'],
            ['原子習慣', '商業', '詹姆斯·克萊爾'], ['窮爸爸富爸爸', '商業', '羅伯特·清崎'], ['思考致富', '商業', '拿破崙·希爾'], ['從A到A+', '商業', '詹姆士·柯林斯'], ['影響力', '商業', '羅伯特·席爾迪尼'],
            ['原則', '商業', '瑞·達利歐'], ['投資最重要的事', '商業', '霍華·馬克斯'], ['零到一', '商業', '彼得·提爾'], ['藍海策略', '商業', '金偉燦'], ['定位', '商業', '艾爾·賴茲'],
            ['槍炮、病菌與鋼鐵', '歷史', '賈德·戴蒙'], ['文明的衝突', '歷史', '杭亭頓'], ['絲綢之路', '歷史', '彼得·弗蘭科潘'], ['世界史綱', '歷史', '威爾斯'], ['中國通史', '歷史', '錢穆'],
            ['羅馬帝國衰亡史', '歷史', '吉朋'], ['萬曆十五年', '歷史', '黃仁宇'], ['中東史', '歷史', '伯納德·劉易斯'], ['二戰回憶錄', '歷史', '邱吉爾'], ['大國崛起', '歷史', '唐晉'],
            ['航海王', '漫畫', '尾田榮一郎'], ['火影忍者', '漫畫', '岸本齊史'], ['進擊的巨人', '漫畫', '諫山創'], ['鬼滅之刃', '漫畫', '吾峠呼世晴'], ['咒術迴戰', '漫畫', '芥見下下'],
            ['灌籃高手', '漫畫', '井上雄彥'], ['七龍珠', '漫畫', '鳥山明'], ['哆啦A夢', '漫畫', '藤子·F·不二雄'], ['獵人', '漫畫', '冨樫義博'], ['名偵探柯南', '漫畫', '青山剛昌']
        ];
        booksData.forEach(b => booksStmt.run(b));
        booksStmt.finalize();

        // 匯入借閱紀錄
        const borrowStmt = db.prepare('INSERT INTO borrow_records (book_id, borrower_name, borrow_date) VALUES (?, ?, ?)');
        const borrowData = [
            [1, 'User_A1', '2023-10-01'], [2, 'User_A1', '2023-10-05'], [3, 'User_A1', '2023-10-10'], [4, 'User_A1', '2023-10-15'], [5, 'User_A1', '2023-10-20'],
            [6, 'User_A1', '2023-10-25'], [7, 'User_A1', '2023-11-01'], [8, 'User_A1', '2023-11-05'], [9, 'User_A1', '2023-11-10'], [10, 'User_A1', '2023-11-15'],
            [1, 'User_A1', '2023-11-20'], [2, 'User_A1', '2023-11-25'], [3, 'User_A1', '2023-12-01'], [4, 'User_A1', '2023-12-05'], [5, 'User_A1', '2023-12-10'], [6, 'User_A1', '2023-12-15'],
            [1, 'User_B1', '2023-10-01'], [2, 'User_B1', '2023-10-05'], [11, 'User_B1', '2023-10-10'], [12, 'User_B1', '2023-10-15'], [21, 'User_B1', '2023-10-20'],
            [22, 'User_B1', '2023-10-25'], [31, 'User_B1', '2023-11-01'], [32, 'User_B1', '2023-11-05'], [41, 'User_B1', '2023-11-10'], [42, 'User_B1', '2023-11-15'],
            [3, 'User_B1', '2023-11-20'], [13, 'User_B1', '2023-11-25'], [23, 'User_B1', '2023-12-01'], [33, 'User_B1', '2023-12-05'], [43, 'User_B1', '2023-12-10'], [4, 'User_B1', '2023-12-15'],
            [21, 'User_C1', '2023-10-01'], [22, 'User_C1', '2023-10-15'], [23, 'User_C1', '2023-11-05'], [24, 'User_C1', '2023-11-20'],
            [1, 'User_D1', '2023-10-01'], [12, 'User_D1', '2023-10-20'], [23, 'User_D1', '2023-11-10'], [34, 'User_D1', '2023-12-01']
        ];
        borrowData.forEach(row => borrowStmt.run(row));
        borrowStmt.finalize();

        console.log('資料庫初始化與種子資料重設完成！');
    });
}

function classifyBorrower(totalBorrows, singleGenrePercentage) {
    if (totalBorrows >= 10) {
        return (singleGenrePercentage >= 70) ? '狂熱專精讀者' : '廣泛閱讀達人';
    } else {
        return (singleGenrePercentage >= 70) ? '休閒小品讀者' : '潛力新手讀者';
    }
}

app.get('/books', (req, res) => {
    db.all('SELECT * FROM books', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/borrow', (req, res) => {
    const { book_id, borrower_name } = req.body;
    const borrow_date = new Date().toISOString().split('T')[0]; 
    
    const sql = 'INSERT INTO borrow_records (book_id, borrower_name, borrow_date) VALUES (?, ?, ?)';
    db.run(sql, [book_id, borrower_name, borrow_date], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: '借閱成功！', id: this.lastID });
    });
});

app.get('/borrowers/:name/analysis', (req, res) => {
    const borrowerName = req.params.name;
    const sql = `
        SELECT 
            COUNT(br.id) AS totalBorrows,
            COUNT(DISTINCT br.book_id) AS uniqueBooksCount,
            (SELECT MAX(genre_count) FROM (
                SELECT COUNT(*) AS genre_count 
                FROM borrow_records br2 
                JOIN books b2 ON br2.book_id = b2.id 
                WHERE br2.borrower_name = ? 
                GROUP BY b2.genre
            )) * 100.0 / COUNT(br.id) AS singleGenrePercentage,
            (SELECT b2.genre 
             FROM borrow_records br2 
             JOIN books b2 ON br2.book_id = b2.id 
             WHERE br2.borrower_name = ? 
             GROUP BY b2.genre
             ORDER BY COUNT(*) DESC LIMIT 1) AS topGenre
        FROM borrow_records br
        WHERE br.borrower_name = ?
    `;

    db.get(sql, [borrowerName, borrowerName, borrowerName], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row || row.totalBorrows === 0) return res.status(404).json({ message: '找不到該借閱者的紀錄' });

        const totalBorrows = row.totalBorrows;
        const uniqueBooksCount = row.uniqueBooksCount;
        const singleGenrePercentage = Math.round(row.singleGenrePercentage);
        const topGenre = row.topGenre;

        const readerType = classifyBorrower(totalBorrows, singleGenrePercentage);
        let recommendSql = (readerType === '狂熱專精讀者' || readerType === '休閒小品讀者') 
            ? 'SELECT * FROM books WHERE genre = ? LIMIT 5' 
            : 'SELECT * FROM books WHERE genre != ? LIMIT 5';

        db.all(recommendSql, [topGenre], (err, books) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
                borrowerName, features: { totalBorrows, uniqueBooksCount, singleGenrePercentage, topGenre },
                classification: readerType, recommendations: books
            });
        });
    });
});

app.listen(port, () => { 
    console.log(`伺服器已啟動！服務網址為 http://localhost:${port}`); 
});