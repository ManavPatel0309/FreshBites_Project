import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { add } from "../Store/cartSlice";

import {
  FaPaperPlane,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa";

import DATAS from "./Datadetail";

const Foods = () => {
  const dispatch = useDispatch();
  const itemsPerPage = 12;

  const [foods, setFoods] = useState(DATAS);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("default");

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API || "http://localhost:5000"}/api/foods`);
        const data = await response.json();

        if (data.success) {
          const backendFoods = (data.foods || []).map((food) => ({
            id: `backend-${food.id}`,
            dbId: food.id,
            title: food.name,
            name: food.name,
            price: Number(food.price),
            category: food.category || "",
            image:
              food.image ||
              "https://cdn-icons-png.flaticon.com/512/1046/1046784.png",
            description: food.description || "",
            source: "backend",
          }));

          const staticFoods = DATAS.map((item) => ({
            ...item,
            title: item.title || item.name,
            name: item.name || item.title,
            price: Number(item.price || 0),
            source: "static",
          }));

          setFoods([...backendFoods, ...staticFoods]);
        } else {
          setFoods(DATAS);
        }
      } catch (error) {
        console.log("Fetch Foods Error:", error);
        setFoods(DATAS);
      }
    };

    fetchFoods();

    const interval = setInterval(() => {
      fetchFoods();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  let filteredFoods = foods.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (sortOrder === "priceLow") {
    filteredFoods.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sortOrder === "priceHigh") {
    filteredFoods.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (sortOrder === "Alphabetically, A-Z") {
    filteredFoods.sort((a, b) =>
      String(a.title || "").localeCompare(String(b.title || ""))
    );
  } else if (sortOrder === "Alphabetically, Z-A") {
    filteredFoods.sort((a, b) =>
      String(b.title || "").localeCompare(String(a.title || ""))
    );
  }

  const totalPages = Math.ceil(filteredFoods.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;

  const currentFoods = filteredFoods.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleAddToCart = (item) => {
    dispatch(
      add({
        id: item.id,
        title: item.title,
        name: item.name || item.title,
        price: Number(item.price),
        image: item.image,
        category: item.category || "",
        description: item.description || "",
      })
    );

    alert(`${item.title} added to cart ✅`);
  };

  return (
    <>
      <div className="foods-container">
        <div className="foods-header">All Foods</div>

        <div className="search-filter-bar">
          <input
            type="text"
            placeholder="I'm looking for..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />

          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="default">Default</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
            <option value="Alphabetically, A-Z">Alphabetically, A-Z</option>
            <option value="Alphabetically, Z-A">Alphabetically, Z-A</option>
          </select>
        </div>

        <div className="food-grid">
          {currentFoods.length === 0 ? (
            <p>No matching food found.</p>
          ) : (
            currentFoods.map((item) => (
              <div
                className="food-card"
                key={`${item.source || "food"}-${item.id}`}
              >
                <img
                  src={
                    item.image ||
                    "https://cdn-icons-png.flaticon.com/512/1046/1046784.png"
                  }
                  alt={item.title}
                />

                <h4>{item.title}</h4>

                {item.description && <p>{item.description}</p>}

                <div className="price">
                  ₹{Number(item.price || 0).toFixed(2)}
                </div>

                <button type="button" onClick={() => handleAddToCart(item)}>
                  Add to Cart
                </button>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              type="button"
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                type="button"
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={safeCurrentPage === index + 1 ? "active" : ""}
              >
                {index + 1}
              </button>
            ))}

            <button
              type="button"
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-section">
            <img
              src="https://react-food-project-five.vercel.app/static/media/res-logo.150c9007ec5a83adf3c4.png"
              alt="Fresh Bites"
              className="footer-logo"
            />
            <h3>Fresh Bites</h3>
            <p>
              Welcome to Fresh Bites, your ultimate destination for delicious
              and fresh online food ordering!
            </p>
          </div>

          <div className="footer-section">
            <h4>Delivery Time</h4>
            <p>
              <strong>Monday – Friday</strong>
              <br />
              10:00am – 11:00pm
            </p>
            <p>
              <strong>Saturday – Sunday</strong>
              <br />
              Full Day
            </p>
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
              <button type="button" className="send-btn">
                <FaPaperPlane />
              </button>
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
  );
};

export default Foods;