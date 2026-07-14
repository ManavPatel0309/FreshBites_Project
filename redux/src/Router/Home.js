import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import DATAS, { pizzaData } from './Datadetail'
import { useEffect, useState } from 'react';
import { add } from '../Store/cartSlice'
import { FaFacebookF, FaInstagram, FaYoutube, FaLinkedin, FaPaperPlane } from 'react-icons/fa';



let testimonials = [
  {
    text: `Fresh Bites truly lives up to its name! Every bite bursts with freshness and flavor. From the crisp salads to the hearty sandwiches, each dish is a delightful journey for the taste buds.`,
    author: 'Smit Patel',
    img: 'data:image/jpeg;base64,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',
  },
  {
    text: `Fresh Bites redefines freshness with every dish. I couldn't believe the difference in taste until I tried their farm-to-table ingredients. It's like they’ve captured the essence of freshness in every bite.`,
    author: 'Avneet Kuar',
    img: 'https://react-food-project-five.vercel.app/static/media/ava-2.4f1e1390881d9d14161b.jpg',
  },
  {
    text: `I've never experienced such a fresh and tasty food delivery service before! The packaging, the flavors, everything speaks quality.`,
    author: 'Raj Shah',
    img: 'https://react-food-project-five.vercel.app/static/media/ava-3.be14ed46c29393555a87.jpg',
  },
];

const Home = () => {
  
  let [current, setCurrent] = useState(0);

  useEffect(() => {
    let interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const { text, author, img } = testimonials[current];

  const [sold, setSold] = useState(DATAS);


  const cartItems = useSelector((state) => state.cart.items); 
  const dispatch = useDispatch();

 let ADDTOCART = (item) => {
  dispatch(add(item)); 
};


  const SELECTBTN = (category) => {
    const filtered = DATAS.filter((item) => item.category === category);
    setSold(filtered);
  };




  return (
    <>
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-text">
          <h4>Easy way to make an order</h4>
          <h1>
            HUNGRY? <span>Just wait</span> <br />
            food <span>at your door</span>
          </h1>
          <p>
            Welcome to Fresh Bites, your ultimate destination for delicious and fresh online food
            ordering!
          </p>
          <div className="hero-buttons">
            <button className="order-now">Order now</button>
            <button className="see-foods">See all foods</button>
          </div>
          <div className="features">
            <span>🚚 No shipping charge</span>
            <span>🔒 100% secure checkout</span>
          </div>
        </div>
        <div className="hero-image">
          <img src="https://react-food-project-five.vercel.app/static/media/hero.e3ef74be66b8a37b4de8.png" alt="Delivery" />

        </div>
      </div>
      <div>

        <button className="card-item">🍔 Fastfood</button>
        <button className="card-item">🍕 Pizza</button>
        <button className="card-item">🍜 Asian Food</button>
        <button className="card-item">🥤 Cold Drink</button>

      </div>
      <div className="home-section">
        <section className="service-section">
          <h2 className="section-subtitle">What we serve</h2>
          <h1 className="section-title">
            Just sit back at home <br />
            <span className="highlight">we will take care</span>
          </h1>
          <p className="section-description">
            At Fresh Bites, we serve a delectable array of dishes crafted with care and made with the freshest ingredients.
            <br />
            From wholesome salads to savory entrees and delightful desserts, there's something to satisfy every craving.
          </p>

          <div className="features">
            <div className="feature-box">
              <img src="https://cdn-icons-png.flaticon.com/128/9561/9561688.png" alt="Quick Delivery" />
              <h3>Quick Delivery</h3>
              <p>Experience lightning-fast delivery with Fresh Bites, ensuring your meal arrives swiftly to your doorstep.</p>
            </div>

            <div className="feature-box">
              <img src="https://cdn-icons-png.flaticon.com/128/6018/6018460.png" alt="Super Dine In" />
              <h3>Super Dine In</h3>
              <p>Experience the ultimate dining convenience with Super Dine In, where delicious meals are just a click away.</p>
            </div>

            <div className="feature-box">
              <img src="data:image/png;base64,UklGRlIWAABXRUJQVlA4WAoAAAA4AAAAxwAApAAASUNDUKgBAAAAAAGobGNtcwIQAABtbnRyUkdCIFhZWiAH3AABABkAAwApADlhY3NwQVBQTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWxjbXMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAF9jcHJ0AAABTAAAAAx3dHB0AAABWAAAABRyWFlaAAABbAAAABRnWFlaAAABgAAAABRiWFlaAAABlAAAABRyVFJDAAABDAAAAEBnVFJDAAABDAAAAEBiVFJDAAABDAAAAEBkZXNjAAAAAAAAAAVjMmNpAAAAAAAAAAAAAAAAY3VydgAAAAAAAAAaAAAAywHJA2MFkghrC/YQPxVRGzQh8SmQMhg7kkYFUXdd7WtwegWJsZp8rGm/fdPD6TD//3RleHQAAAAAQ0MwAFhZWiAAAAAAAAD21gABAAAAANMtWFlaIAAAAAAAAG+iAAA49QAAA5BYWVogAAAAAAAAYpkAALeFAAAY2lhZWiAAAAAAAAAkoAAAD4QAALbPQUxQSKkLAAABsIb/nyFJ0i8icrzePa1t28bZtm3bXPvsPdu2V4OzjbV3ujMift8XU13TXZWZz72MiAnQ/21jGjMMu/HDoDv4biefMvKke2yjMNySPsuYD1Mack9jJq/b+oZdFYZb1FEUG1z5Y9SAD9r6Kuo6hc8pDDhJP6UAZF6hOOSS3kc2uHBPpWH3VIqhcuPuikMu6jCqofCbqEEfdKerqHbhM4qDTtIPmS1lhpcMvUbvZeRpSoMuLNLDL/vOl776w2/vpCYMshBTDJrHEFMcUCHFoJEb73rkXR/ymCc+9SmPf/T9Tz5ku6UaGVMcQiElSdriqMef+cXf/u/mwpiz1//78o++5sH7LZWkFMOgCTFJ2vy01//gv2a0S85tm3M1o9f+5XPPOWyRpBQHS0iStnzkZ/7Bum0utVaPXWspbQbwby4+ZYWkNEhCkpbc/WPXACWXamPm0bjWkg384cwDJKXBEZJ05xf9GsilGrOQNi65AN9+0GIpDYskbXfm9dBmMJNoXLLht09bJqXhkKQ7nHEzzGS43XgSsI1LgT8+MSiGYRCSwnOvgpkMV3zr33gyANuUDJefJqUhkKRjLoPZFr79vA/cgJlg25QMl2ypGHqv0ZIzoZ2Fn590j9VQsScHMJTKNY+WUr+FqP1X4xn46wOaN0A2NpNt4xYu2VBNn0XpSbPMttz+Rm30M1ywmXybWvj9wUr9laTzYQa+s48OuZbWmOk0bpl9mELoqaTlX6HMwkul+7S0YKbVJsMrpdBLSXe4lLbl78dID4KMzfTaVHOhFHoo6Q6/ZDbzwztK94WCzTTb1MK7pNA7SZv/itnCR4N0TKZgM+XGmXdKoWeiVlzKbOE8SbteT8ZMv3HmTMV+CdJXaAtnKWjFr8iYLjQuPFepV6LOo81cKCV9nBZ3A6bC3dX0SKNHU1o+Ji3SU8i26UhTuG57xd6I2vM2ZvlJVKM9bqdiOtO0/Eh9+hNm+e+WStK3yJgONS2vUuqJpJfTwmlKSU8g444x9WDFXoja5XZa3qYUtMm/qJhONZkfqB+DPsMMqxqFpDeSMR1rZ56g1ANRJ1ErJygFbX0D1d1D4S8rFLov6LvMcImikt5Ci+lck3m+UudFnUJh7W6KQXf4H9V0sCt/WaHOD/oia7lASUnPIrubyDxZqeOi9iqwdndFSVdQ6GYXfqauT3oTM3xMUVFHY7ujbI5S7DYt/h2Zk0ecTktHm8z5Sp0WdRyFXy2SpOa3VHcULvxmmUKXNTqdGd6spKhDCu4uV45U7DKFH5E5VFGNnk82nUXmFUodFrTtWvP7DRUU9HEy3e3CNxU7LOruzHKJkqQlf6G6u6j8ZTOF7kp6LbO8UElBu7aY7rbtgxS77KO0nKomLtIDcJdB5v5K3SX9kJrvpHVfQO40Z16q2FlBG/0Orj9xv4MPPnTXT5LpuIs77c5X4To7smJ3GYXPdFjUDrfVXOrI0vWzfLfTdqdP13RRTCMXaYfvfac3v/3Td2pRGh26o/9DRwSd+pTHPX70E3r18aMf+/RdFLoh6Qv0/KPUdMVzmKmlv33bXordEHSXG8nu7Rm+oKCOTHo8tKWnZ7l2x+5Q0JNuo7d/e4CiujNox9d+e+XKlStXrVmzZs3q1atWrVrZtatWrVq9ZszVK0df+YWnLFdUlyb1eFS3hhhCCFp6yj1OOnL3OyxbJzahI2MTJMWNdj3hPnPef0/FMDoFdXHUOwC3t/3pG2c/bEtJUR0Yk6SdHnfxj69pGXP2ZEV1edSXmWXOGz57dylNXUjSXZ75g9sY6TnXcp6ajjsRqu1a2gJ89yCFMF1J2v3864DSluq5W248SLHTFPU0XLGNnQvl2VKYoijd+by1kIuNDWBTC1fspqCOj3opxRhsnOE8KUxNIz3pamirMaNtMrxjkaI6P+oMsjGAqYULNa0havuvQ1uxGW3jltsfIyV1f5A+QMYGMM68TnEqovSwG8gVmzltauaXeysG9WGQvkaLDWBceaTSFCTpPMhg5rYp8LHlatSTURv+iowNYCoz+ylNXKM7fo9asZnbJsNLpKTeTNrpWgqjTOZXSxQmLOnAv9Eam7mNW645VSGoRxudAhUD2LRcrDRRIeo+a2nBZm7jzBXbK6lfGz2XYhvAduHBaiYoSM+GjM3cNrXy0cVq1LdBHyczAlO4dlvFiYnS26BgM7dNgddKSb0btfEfKXgdTOabmtgkfZBSMWPaZOqjpKgeTjoejNfBZF6iNBmNVnydbMyYNi3XHa+kfk46nTxGhSOUJqHRlitpjRnT0PLHXdSop4OW/oaC18EUfrdCYeEa7f13WjBjGmd+voUa9XbSfagehcm8X3HBkk64kRabMY0zX1mspB4P+hKZOezCU9QsTAh6eCVjM6Zx5qNSUp9HHQ72CEyFk9UsRJReBgWbMY0L75Si+j3qk2Q8AlO45RAtmr8kvQNXbMY0LpwrRfXe0dhzmcwNh6iZr0YbfZ1SMeMaF86Wgno/6IeUObDJ3HoPKc5HjNrj17TGjGtcOF0K6v+kJ5HxKGwKvFJKcX1Ckh5zCy2YcY0LZ0tBAzBo25uozG1T4Lv7SjGFuUKK0s6fgozNuMaZd0hBgzDqG2TPhY0z+aJdJYUQU4pBknY481ZKxWZcm5aPSkHDMOkVlHHAkGHtJx68lebc6kEfuxWysRmPlq9JUQMx6ljqeNg4A9df+v7Xv+Qlb/jAZdcB2diMb1ouXaKooRi01U2sBxg7F8Ys2caMb5P5+52VNCCWr6KsD9i4ljyyVGOzvqZw6/5qNCi/QfZ6LbyxuZ8aDcmkj5GZdNuZl6jRoGz0HlpPmE3LxxU0NC4mTxyZXy1XHBzvpJ0wU7ltbyUNjg/TMtHGlYep0dCM+jzZE9ZyjpKGZ/oJhUk2mR9IYXAEbfoX6iSZwlVbK2pwRu1S8QSZCier0RC5F3WCbGdepqQBmvR6yuTYtHxaQcPkC+QJIvO7DRUHiRavpDCppjJ7gJKGaNCW/6N6Qowrj1KjQRq1e4uZTJuWsxU1VA6gTgwt35bC4DOZv99RUYNlz4o9CaaSD1XSUA3a6irqJBhXHqNGAzZcSpkAm5bTFTVgk95JthfKpuVzUuiDEEOc9BDWiTqZumA2LSuXKar7Y9RUJq0bLqWwUGSu2l5J3R+lO+yw/eQvl4LU6HEUL4wpzBymRt0fteen/nnT5N/w29c2CiHo8QtlKtxbjbo/6rBbmdKvN9Lix19NZSFNNU9WUh82q5mpnsIyyyu15MtQ8QKYWnmRonow6WSKbSbdpvBn7dZS8AKYWnm9gvqw0WNpbabQrpyoNRSbeTe18hb1CtORea/eRGbebKp5vULQsMGVfyzeB3u+bAq8RCGoR5gSCvfWpZR5ssnweIWgwYMzn9CryHg+jFtuvpuSenO6KldvvHPB82BTM7/aTUnDiMwj9APyetkmwyc2UKNhhAtf0fMo9ng2binPkpIGU+XGO225lvUwZHPlwQpBgwlnnqyvkhnTpmZ4U1JSz04Zhe/qSRR7DuMMlx4lJQ0qV27fYZObGWVDqdz2kqAUNKxw5vn6LBnApmb49C5SUg9PG4Vf6BEU28YZ1txDSurlabMpey+7hmqc4ZoXLlKMGmI481pdQqZU6kV3kZL6euoorNF9mc3wxQOlpP6eOhsO0Z/h0rtJKWi44czpOuCix0ghqtenj8pvl0pSUs9Pn21O1OKk3p8+nDlfSQPBU0XmaxqCI5hmO/N5hUHwGFp7CjwnzPIipQEQdRjVeL6M56yjy5x5zlJafr+hwgBQ0BeYKWPm9S+lmoW9cmdFDYM7XsaC1/b2W2689qr//OOvf/zdr1dfednPfvT973zti5/+6AffffHpD1qkqGEYtfS537nysp98/5tf+dwnLnnfOy846y2vf+VLnveMJz/24Q+6z91OPuHYIw89aL+9d99lh223vNPmm2ywbFHU+kYNxajJDyGmuWPQcAwpzmcaM44Oo9f5vzIAVlA4IBAIAAAQKwCdASrIAKUAPi0Uh0KhoQ0X8goMAWJYm78aDMDiL/47lt7meIAWKX8AP0r1AD8AP0AtP/LAf2D8ALoiRr6P+RXf0d255+JP5JdXRrj3H/bn/LdVyjrqS+0/1D9rP6n83vRN5gH6O/2H+h/s7/aP//3svMB/Mf7J/o/8B70X+S/uX8A9yv5Ae4B/MP6v1jPoAfyP+iel5/4f8B8FH7Kf9n/KfAJ/Hf6T/sfzM7gD1Ef4B1l508t4b0v6LXQq+xAXD5xSkJsVhaXHks+FqWpxiLXeQHLdoBY3GvGRHRiQ5wwrmbpwZEox7gNIlhVcPmwn3aS//2O/Q7XWs8Ai72XA7OXd8SZvtZYJ3FI79496tGgWSie+gHoF/6+ixn10fNZPIxELo85VsUQ+zWK8IAtcsxSvQ/DNSLzXIbq/MbKe8LrrxgfOMcWqcseCf9lyuNj/ONyR0XrashoQhGlvF7nswAD+jisGiyoDI/39LBMkqoxdnWau9ArU2KwdM54MCd//4MJtlCFOtemtP5IDZVgHtgf7VdgFgGFMY/DZa7PBgEUxK++Au5jOFOzGolKpQB1Mg3rdaf0JWkciTjZkAHeIOo/TRjOns+JhAABBf/sNpv/4joq/FjeUETNbq1/NfMStZMjxHas/woM0eDIl35Y8X5Mb/EJmJrljCIB7E3B/uMbOaklMDs0HYy+kFcfth0+bFB0RQrHGhjjJw6x92VlgP8Bn7We6ap87O5YXCFivUo5+53gYXRxARzP7GY9PruXLfdyfKhRYCz8U912CE/u2/68SEgzql9Wqf/HgP8L1/UlgQOTJ8e9K6cNsl2xZ2DlAfUvPsd3lFocX5G7Of89CICJiRGh0UWriPY7TwAAAUpwuhnftSNpsflddzprLSs/07V4kZU+6Iwty098ZcgEmBq+88zF5pxuLhefCTYg//ZIf5iamLQNeypqzJ4vqL/6+yN++Hz/n3+oTn0l4F/OWVbecXe8l7hbW4sidIB9cHCVkHgOq8iICJ29Q4YNv3bmMoberoCmbMcwSUdfJY69RT4Gm9jcfW/PXNqA5MGHjwbOgcVmDVEFEbqBiCCxDLJnZSMy8FpII6HNE64Gz7h//Dvc/wY/94b99FyLOxQaQfGRdlGLKuvMIQKPhMAp847Ymo97cGmVGhYHWdwvsBYu9PS452FiI6ow4yvV7t4CLFsswuLAeWZMq2GyElLrWa10FdR2Glkovx9bxl8te7foKqu9OVnxBwX1cdBqvVWVH+l8bROqpot6aI4jTl4OhEWpyW+hp9+bNaei0tT9hXuRPUGnqDgHs6Zov9etIObaPbyHuElPlLDZK1jPmIomW7XS8ADG1BbUzYb8UhqmtXtGSJGKzk1+pLHTUdjtucv7lxSm4bftXWZBW9plRAVARyGFuVeW5Ai72EDq8bPKIvsI9VBiF6RVi4A0t75ZMIVzarC8HsN5JmeG8csk88TzmJxRuS2MMPJWF7TJt+u+RPFZs90RK3p8g4kDUnHiEHCf+aB6PAUYHJFnY0AH2QlfHI5ZdJAjMQBIxMJ+cro8yyNQMSN1KISen+stUH5zLy9vngEHtzliFw7l1NM+qXQyJDYAjtDh2Kj9hqSRhjV3U4eLltqM6kEKQO7ZJ77V63aN2c6b+EYikk/7gNfQ4qaVG+hWaKspVjMIb691DwdRkwUCA8iAUgKTjfLUJa7RK9kcenjjSQ8+fDujIJSdotdsD04Ld++chppI+k4wq15sAcGpIklOpAr0YYAZs6k36jL6BPynbR0dGiCjybML8aD/pot6QaDh8RzyP8UcSJ1LSpQr7BPyQFP6+qwaTst1v29obOcqGrCY+XgH/7ZSYPgP/dc81GVeXjMv7bPZEzORXDdoRTRpp2XjSADJK3ke7UKPgXU435YutfTixf85hjpJ4oVzZ/Rh4OISjIriOgOYOd1GOf/iDLPf1ZSVGdJTdSLcGekqXeVOUBGY9iT9Fz6gZDY/LjeIdGMbicoYV8DMO5u6Ko6WJD4AQkT/ZK7QH0H7FeEvztudAUveXGRtP3A5/O+nzzVyyZp/Sch0dPHdmTZdnMmsmtK6P26ihSI7XQf/vOHQjYsqD+/3FB95jGu9xbESNFE5F3okWw/mZysb4tIKsuUtfZsYG7HkUtcWOMfUULK88XCpsCXpEN5sT707VoqMEhX5u4JLNWdhkKDk4NRRbZfhmRce/ihx4KzaaEXH5wRR0KXJ7LDmEnXrNVNmAgPyoGBnEqa+Hu4o440LVWHHa+8sNjbqA3gPEmKx5xFbW29lfx7s5EXKdk8PwTRS0cnMnrBEj//zNOqs5CaBgHonTiIdo241b/6sy8NBVWChb0on+G3jP8uVrPlvhbOGe6gE70DJ33sb2NtovDmDIT4Ptk+uFSmsH9whTH8GOZBr6OYeNNSVOzLthp630i75iKDCzLFC2lgPsUytK6N2hSHANgWwp8oOg8uzymhP0hkQsMzwN55ZzBVZlcdRrc8ouuPAL+oiTmeKKZoAp5UmMPGwOIZZjpQRkuGvRAqjYTAbiqHL7SiQii8L560C71CKiLC5r3+qElFX2Z7KGzmDS5MpTk7ImllrOn4RZuf0HZkkBIml+ulG4RL6K2nebCtYXyOvudma0AEWMwjcWqyDT6ny92xDd8X7ZvjuT//6+zI1ZNTLXLVCQr0R4C8gAGMPahKYWb6ReIvsJrEO+0CHv2b1LHloqKZAUo5zHPS6jwRhvwTudjOemy15S1Ly2Oj7YAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASRkBAOgDAABJGQEA6AMAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAADIAAAAA6AEAAEAAAClAAAAAAAAAA==" alt="Easy Pick Up" />
              <h3>Easy Pick Up</h3>
              <p>Enjoy the convenience of easy pick-up options, making your Fresh Bites experience even more seamless.</p>
            </div>
          </div>
        </section>
      </div>

      <h2 class="section-title">Popular Foods</h2>
      <div className='nav-link123'>
        <button style={{ padding: "10px 25px" }} onClick={() => setSold(DATAS)}>All</button>
        <button style={{ padding: "10px 25px" }} onClick={() => SELECTBTN("Burger")}> 🍔 Burger</button>
        <button style={{ padding: "10px 25px" }} onClick={() => SELECTBTN("Pizza")}> 🍕 Pizza</button>
        <button style={{ padding: "10px 25px" }} onClick={() => SELECTBTN("Snacks")}> 🍟 Snacks</button>
        <button style={{ padding: "10px 25px" }} onClick={() => SELECTBTN("Drink")}> 🥤 Drink</button>








      </div>
      <div className='food-container'>
        {sold.length === 0 ? <h1>Plz find valid searches</h1> : ""}
        {sold.map((items) => {
          return (
            <div className='food-popup' key={items.id}>
              <div className='food-item'>
                <Link to={`items/${items.id}`}>
                  <img src={items.image} alt={items.title} />
                  <h2>{items.title.slice(0, 16)}</h2>
                </Link>

                <div className='price-cart'>
                  <span className='price'>₹{items.price}</span>
                  <button className='add-to-cart-btn' onClick={() => ADDTOCART(items)}>
                    ADD TO CART
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="why-section">
        <div className="why-image">
          <img src="https://react-food-project-five.vercel.app/static/media/location.c2a808618ecbf53c92bc.png" alt="Delivery Illustration" />
        </div>

        <div className="why-content">
          <h2>Why Fresh Bites?</h2>
          <p>
            At Fresh Bites, we’re not just a food service — we’re a culinary journey.
            Discover the unparalleled freshness and taste that sets us apart.
            From farm-fresh ingredients to expertly crafted dishes,
            every bite is an experience worth savoring.
          </p>

          <ul>
            <li>
              <span className="icon">✔️</span>
              <strong>Fresh and tasty foods</strong><br />
              Indulge in a world of fresh and tasty foods meticulously prepared by our talented chefs. Each dish is a masterpiece of flavor, showcasing the finest ingredients and culinary expertise.
            </li>

            <li>
              <span className="icon">✔️</span>
              <strong>Quality support</strong><br />
              We pride ourselves on delivering not only exceptional food but also outstanding support.
            </li>

            <li>
              <span className="icon">✔️</span>
              <strong>Order from any location</strong><br />
              With our convenient platform, delicious food is always just a tap away.
            </li>
          </ul>
        </div>
      </div>
      <div className="food-container">
        {pizzaData.slice(0, 4).map((item) => (
          <div className="food-card" key={item.id}>
            <img src={item.image} alt={item.title} className="food-image" />
            <h3>{item.title}</h3>
            <div className="price-cart">
              <span>₹{item.price}</span>
              <button className="add-to-cart-btn" onClick={() => ADDTOCART(item)}>
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>


  <div className="testimonial-wrapper">
      <div className="testimonial-left">
        <h3 className="testimonial-subtitle">Testimonial</h3>
        <h2 className="testimonial-title">
          What our <span>customers</span> are saying
        </h2>
        Fresh Bites truly lives up to its name! Every bite bursts with freshness and flavor. From the crisp salads to the hearty sandwiches, each dish is a delightful journey for the taste buds.
       <br/>
        
        <br/>
        <p className="testimonial-text">{text}</p>
        <div className="testimonial-author">
          <img src={img} alt={author} className="testimonial-photo" />
          <p className="testimonial-name">{author}</p>
        </div>
      </div>

      <div className="testimonial-right">
        <img
          src="https://react-food-project-five.vercel.app/static/media/network.7deb539d0303413c1704.png"
          alt="Network Graphic"
          className="testimonial-image"
        />
      </div>
    </div>
  </div> 
      
          <footer className="footer">
        <div className="footer-grid">
          <div className="footer-section">
            <img src="https://react-food-project-five.vercel.app/static/media/res-logo.150c9007ec5a83adf3c4.png" alt="Fresh Bites" className="footer-logo" />
            <h3>Fresh Bites</h3>
            <p>
              Welcome to Fresh Bites, your ultimate destination for delicious and fresh online food ordering!
            </p>
          </div>

          <div className="footer-section">
            <h4>Delivery Time</h4>
            <p><strong>Monday – Friday</strong><br />10:00am – 11:00pm</p>
            <p><strong>Saturday – Sunday</strong><br />Full Day</p>
          </div>

          <div className="footer-section">
            <h4>Contact</h4>
            <p>Location: Sola, Ahmedabad</p>
            <p>Phone: 8511755852</p>
            <p>Email: divy2332gj2@gmail.com</p>
          </div>

          <div className="footer-section">
            <h4>Newsletter</h4>
            <p>Subscribe our newsletter</p>
            <div className="newsletter">
              <input type="email" placeholder="Enter your email" />
              <button className="send-btn"><FaPaperPlane /></button>
            </div>

            <div className="social-icons">
              <FaFacebookF />
              <FaInstagram />
              <FaYoutube />
              <FaLinkedin />
            </div>
          </div>
        </div>

        <p className="footer-bottom">
          Copyright © 2024, website made by Divy Doshi. All Rights Reserved.
        </p>
      </footer>
</>



  )
}


export default Home
