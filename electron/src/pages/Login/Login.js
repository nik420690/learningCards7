import React, { useState, useEffect } from "react"
import "./styles.css"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { ToastContainer, toast } from "react-toastify"

export default function Login() {
  const navigate = useNavigate()
  const [isDark,setIsDark]=useState(window.matchMedia("(prefers-color-scheme: dark)").matches)
  const [user, setUser] = useState({
    username: "",
    password: "",
  })

  const handleChange = (e) => {
    const key = e.target.name
    const value = e.target.value
    setUser({
      ...user,
      [key]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const result = await axios.post("/login", { ...user })
    if (!result.data.error) {
      toast(result.data.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
      })
      localStorage.setItem("token", result.data.token)
      navigate("/")
    } else {
      toast(result.data.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
      })
      navigate("/login")
    }
  }

  useEffect(() => {
    localStorage.removeItem("token")
  }, [])

  return (
    <div className={`main-container ${isDark?'dark dark-text':'light light-text'}`}>
    
      <ToastContainer />
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>
        <label htmlFor="username">Username</label>
        <input type="text" name="username" id="email" onChange={handleChange} />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          onChange={handleChange}
        />
        <input type="submit" value="Login" />
        <Link to="/register" className={`${isDark?'link-tag-dark':'link-tag-light'}`}>
          Register
        </Link>
      </form>
    </div>
  )
}
