import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

function App() {
  const navigate = useNavigate();
  const [timer, setTimer] = useState(300000);
  const [isDark, setIsDark] = useState(window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [newCard, setNewCard] = useState({ _id: false, question: "", answer: "", picture: "" });
  const [isRemaining, setIsRemaining] = useState(false);

  useEffect(() => {
    const updateDatabase = () => {
      if (navigator.onLine && isRemaining) {
        SyncWithDB();
      }
    };
    const handleOnlineStatus = () => { updateDatabase(); };
    const handleOfflineStatus = () => { updateDatabase(); };
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOfflineStatus);
    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOfflineStatus);
    };
  }, [navigator.onLine, isRemaining]);

  const getCards = async () => {
    const storedCards = JSON.parse(localStorage.getItem("cards"));
    setCards(storedCards);
    setFilteredCards(storedCards);
  };

  const initialLoad = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("/cards", { headers: { authorization: token } });
      if (data.error) {
        toast(data.error, { position: toast.POSITION.BOTTOM_RIGHT });
        navigate("/login");
        return;
      }
      const cards = data.cards;
      localStorage.setItem("cards", JSON.stringify(cards));
      setCards(cards);
      setFilteredCards(cards);
    } catch (error) {
      toast("Something went wrong!", { position: toast.POSITION.BOTTOM_RIGHT });
      initialLoad();
    }
  };

  const SyncWithDB = async () => {
    try {
      setIsRemaining(false);
      const cards = JSON.parse(localStorage.getItem("cards"));
      const token = localStorage.getItem("token");
      const { data } = await axios.post("/syncdata", { cards }, { headers: { authorization: token } });
      if (data.error) {
        toast("Error while synchronizing data!", { position: toast.POSITION.BOTTOM_RIGHT });
        navigate("/login");
        return;
      }
      toast("Successfully synchronized data!", { position: toast.POSITION.BOTTOM_RIGHT });
      initialLoad();
    } catch (error) {
      toast("Something went wrong while syncing data with the database!", { position: toast.POSITION.BOTTOM_RIGHT });
      getCards();
    }
  };

  useEffect(() => { initialLoad(); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.onLine) { SyncWithDB(); } else { setIsRemaining(true); }
    }, timer);
    return () => clearInterval(interval);
  }, [timer]);

  const resetNewCard = () => { setNewCard(prevNewCard => ({ ...prevNewCard, _id: false, question: "", answer: "", picture: "" })); };

  const openPopup = () => {
    resetNewCard();
    document.querySelector("#popup-box").style.display = "block";
  };

  const closePopup = () => { document.querySelector("#popup-box").classList.remove("open"); };

  const deleteCard = async (index) => {
    try {
      const newCards = cards.filter((card, i) => i !== index);
      setCards(newCards);
      setFilteredCards(newCards);
      localStorage.setItem("cards", JSON.stringify(newCards));
      toast("Card successfully deleted!", { position: toast.POSITION.BOTTOM_RIGHT });
      getCards();
    } catch (error) {
      toast("Something went wrong while deleting the card.", { position: toast.POSITION.BOTTOM_RIGHT });
      getCards();
    }
  };

  const handleEdit = (item) => {
    const popupBox = document.querySelector("#popup-box");
    if (popupBox) { popupBox.style.display = "block"; }
    const { _id, question, answer } = item;
    setNewCard({ _id, question, answer });
  };

  const filterBySearch = (event) => {
    const query = event.target.value.toLowerCase();
    if (query === "") {
      setFilteredCards(cards);
      return;
    }
    const filtered = cards.filter((item) => {
      const question = item.question.toLowerCase();
      return question.startsWith(query);
    });
    setFilteredCards(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const popupBox = document.querySelector("#popup-box");
    popupBox.style.display = "none";
    try {
      if (!newCard._id) {
        const r = uuidv4();
        const newCardWithId = { ...newCard, _id: r };
        setCards([...cards, newCardWithId]);
        setNewCard(newCardWithId);
        localStorage.setItem("cards", JSON.stringify([...cards, newCardWithId]));
        toast("Card Added Successfully", { position: toast.POSITION.BOTTOM_RIGHT });
      } else {
        const updatedCards = cards.map((card) => {
          if (card._id === newCard._id) {
            return newCard;
          } else {
            return card;
          }
        });
        setCards(updatedCards);
        setFilteredCards(updatedCards);
        localStorage.setItem("cards", JSON.stringify(updatedCards));
        toast("Card Updated Successfully", { position: toast.POSITION.BOTTOM_RIGHT });
      }
      getCards();
    } catch (e) {
      toast("Something went wrong!", { position: toast.POSITION.BOTTOM_RIGHT });
      getCards();
    }
  };  

  const clearTokenAndRedirect = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleLogout = () => { clearTokenAndRedirect(); };

  return (
    <div className={`${isDark ? 'dark' : 'light'} main-container`}>
      <div id="search-container" className={`${isDark ? 'dark' : 'light'}`}>
        <ToastContainer />
        <input type="text" placeholder="Search" onChange={filterBySearch} id="search-box" />
        <button id={`${isDark ? 'button-dark' : 'button-light'}`} onClick={openPopup}>Add</button>
        <div className="timer">
          <label style={{ color: isDark ? 'white' : 'black' }}>Sync after:</label>
          <select defaultValue={timer} onChange={(e) => setTimer(e.target.value)}>
            <option value={300000}>5 minutes</option>
            <option value={3600000}>1 hour</option>
            <option value={86400000}>1 day</option>
          </select>
        </div>
        <div className="timer">
          <label style={{ color: isDark ? 'white' : 'black' }}>Mode:</label>
          <select defaultValue="default" onChange={(e) => {
            setIsDark(e.target.value === 'default' ? window.matchMedia('(prefers-color-scheme: dark)').matches : !window.matchMedia('(prefers-color-scheme: dark)').matches);
          }}>
            <option value="custom">{window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'Dark'}</option>
            <option value="default">dark</option>
          </select>
        </div>
        <button id={`${isDark ? 'button-dark' : 'button-light'}`} onClick={handleLogout}>Logout</button>
      </div>

      <div className={`App ${isDark ? 'dark' : 'light'}`}>
        {filteredCards && filteredCards.map((item, index) => (
          <div key={index} className="card">
            <button onClick={() => deleteCard(index)}>Delete</button>
            <button onClick={() => handleEdit(item)}>Edit</button>
            <br />
            <h2>{item.question}</h2>
            <p>{item.answer}</p>
          </div>
        ))}
      </div>

      <div id="popup-box" className="popup-modal">
        <div className="popup-content">
          <span onClick={closePopup} className="close">&times;</span>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Question:</label>
              <input type="text" value={newCard.question} onChange={(e) => setNewCard({ ...newCard, question: e.target.value })} id="title" name="title" />
            </div>
            <div className="form-group">
              <label htmlFor="description">Answer:</label>
              <textarea id="description" value={newCard.answer} onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })} name="description"></textarea>
            </div>
            <input type="submit" value={newCard._id ? 'Update' : 'Create'} className="btn btn-primary" />
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;

//testsdadasdasd

//testfqfqfqfq






