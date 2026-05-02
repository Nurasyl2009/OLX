import { query } from './database.js';

const products = [
  {
    title: 'iPhone 14 Pro Max 256GB',
    description: 'Жаңа, қорабы ашылмаған. Батарея 100%. Кепілдік бар.',
    price: 520000,
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800',
    category: 'Электроника'
  },
  {
    title: 'MacBook Pro M2 2022',
    description: 'Өте жақсы жағдайда, сызатсыз. Программист ұстаған. Жад: 512GB SSD, 16GB RAM.',
    price: 780000,
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
    category: 'Электроника'
  },
  {
    title: 'Sony PlayStation 5',
    description: 'Екі джойстик және 3 ойын сыйлыққа беріледі. Аздап қолданылған.',
    price: 250000,
    image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800',
    category: 'Электроника'
  },
  {
    title: 'AirPods Pro 2',
    description: 'Оригинал, шуылды басу функциясы жақсы жұмыс істейді.',
    price: 110000,
    image_url: 'https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?auto=format&fit=crop&q=80&w=800',
    category: 'Электроника'
  },
  {
    title: 'Samsung Galaxy S23 Ultra',
    description: 'Қара түсті, 512GB. Экранда қорғаныш әйнек тұр.',
    price: 490000,
    image_url: 'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?auto=format&fit=crop&q=80&w=800',
    category: 'Электроника'
  },
  {
    title: 'Zara Қысқы күртеше (Пуховик)',
    description: 'Өлшемі L. Өте жылы, су өткізбейтін мата. Жағдайы жаңадай.',
    price: 35000,
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800',
    category: 'Киім'
  },
  {
    title: 'Nike Air Force 1',
    description: 'Оригинал, өлшемі 42. Аппақ түсті, 2-3 рет киілген.',
    price: 45000,
    image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800',
    category: 'Киім'
  },
  {
    title: 'Ерлер классикалық костюмі',
    description: 'Троузерс және пиджак. Көк түсті. Жұмысқа немесе тойға киюге арналған.',
    price: 55000,
    image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800',
    category: 'Киім'
  },
  {
    title: 'Әйелдер кешкі көйлегі',
    description: 'Қызыл түсті, ұзын. Тек 1 рет тойға киілген. Өлшемі S.',
    price: 28000,
    image_url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80&w=800',
    category: 'Киім'
  },
  {
    title: 'Timberland күзгі етігі',
    description: 'Оригинал сары етік. Су өткізбейді. Өлшемі 41.',
    price: 60000,
    image_url: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=800',
    category: 'Киім'
  },
  {
    title: 'Toyota Camry 70 2021',
    description: 'Жағдайы өте жақсы, ұрылмаған, соғылмаған. Майы уақытылы ауыстырылған. Көлем 2.5.',
    price: 15500000,
    image_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?auto=format&fit=crop&q=80&w=800',
    category: 'Көлік'
  },
  {
    title: 'Hyundai Accent 2019',
    description: 'Экономиялық көлік. Қалада айдауға ыңғайлы. Автомат коробка.',
    price: 7200000,
    image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
    category: 'Көлік'
  },
  {
    title: 'Видеорегистратор 70mai Dash Cam Pro Plus+',
    description: 'Ажыратымдылығы жоғары, түнде түсіру сапасы өте жақсы.',
    price: 32000,
    image_url: 'https://images.unsplash.com/photo-1602526430780-781d6d3e4d4b?auto=format&fit=crop&q=80&w=800',
    category: 'Көлік'
  },
  {
    title: 'Michelin Қысқы шиналары 215/55 R17',
    description: 'Комплект 4 дана. Бір маусым ғана қолданылған, шиптері түспеген.',
    price: 120000,
    image_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800',
    category: 'Көлік'
  },
  {
    title: 'Жұмсақ бұрыштық диван',
    description: 'Қонақ бөлмеге арналған үлкен диван. Түсі сұр. Дақтары жоқ.',
    price: 180000,
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
    category: 'Үй жабдықтары'
  },
  {
    title: 'Ас үй үстелі (Ағаштан жасалған)',
    description: 'Оюлары бар әдемі үстел, 6 орындықпен бірге сатылады.',
    price: 150000,
    image_url: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=800',
    category: 'Үй жабдықтары'
  },
  {
    title: 'Түрік кілемі 2х3 метр',
    description: 'Жұмсақ, қалың кілем. Қонақ бөлмеге өте керемет жарасады.',
    price: 45000,
    image_url: 'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&q=80&w=800',
    category: 'Үй жабдықтары'
  },
  {
    title: 'Робот-шаңсорғыш Xiaomi Robot Vacuum Mop 2',
    description: 'Үйді өзі тазалайды, сулы тазалау режимі бар. Телефоннан басқарылады.',
    price: 95000,
    image_url: 'https://images.unsplash.com/photo-1589923158776-cb4485d99fd6?auto=format&fit=crop&q=80&w=800',
    category: 'Үй жабдықтары'
  },
  {
    title: 'Акустикалық Гитара Yamaha F310',
    description: 'Бастаушыларға таптырмас гитара. Дауысы анық шығады. Қапшығымен бірге.',
    price: 75000,
    image_url: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&q=80&w=800',
    category: 'Басқа'
  },
  {
    title: 'Спорттық велосипед Trinx',
    description: 'Жылдамдықтары ауысады. Амортизатор жақсы істейді. Қала ішінде және тауда айдауға болады.',
    price: 85000,
    image_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800',
    category: 'Басқа'
  }
];

async function seed() {
  try {
    // get an admin or seller user
    const users = await query('SELECT id FROM users LIMIT 1');
    if (users.rows.length === 0) {
      console.log('Дерекқорда бірде-бір пайдаланушы жоқ. Өтінемін, алдымен тіркеліңіз.');
      process.exit(1);
    }
    const sellerId = users.rows[0].id;

    for (let product of products) {
      await query(
        'INSERT INTO products (title, description, price, image_url, category, seller_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [product.title, product.description, product.price, product.image_url, product.category, sellerId, 'available']
      );
      console.log(`Қосылды: ${product.title}`);
    }
    console.log('Барлық 20 тауар сәтті қосылды!');
    process.exit(0);
  } catch (err) {
    console.error('Қате кетті:', err);
    process.exit(1);
  }
}

seed();
