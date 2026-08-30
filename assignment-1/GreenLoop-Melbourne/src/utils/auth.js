const USERS_KEY = 'greenloop_users'
const CURRENT_USER_KEY = 'greenloop_current_user'

export const AUTH_CHANGED_EVENT = 'greenloop-auth-changed'

const demoUser = {
  id: 1,
  username: 'GreenLoop User',
  email: 'user@greenloop.com',
  password: 'Green123',
  role: 'user',
}

function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

export function getUsers() {
  let users = []

  try {
    const storedUsers = JSON.parse(localStorage.getItem(USERS_KEY))

    if (Array.isArray(storedUsers)) users = storedUsers
  } catch {
    // Invalid prototype data is replaced with safely seeded accounts below.
  }

  const usedIds = new Set(users.map((user) => user.id))
  let nextId = users.reduce((highestId, user) => Math.max(highestId, Number(user.id) || 0), 0) + 1

  function seedDemoAccount(account) {
    const existingAccount = users.find(
      (user) => user.email?.toLowerCase() === account.email.toLowerCase(),
    )

    if (existingAccount) {
      Object.assign(existingAccount, {
        username: account.username,
        email: account.email,
        password: account.password,
        role: account.role,
      })
      return
    }

    const accountId = usedIds.has(account.id) ? nextId++ : account.id
    usedIds.add(accountId)
    users.push({ ...account, id: accountId })
  }

  seedDemoAccount(demoUser)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  return users
}

export function loginUser(email, password) {
  const normalisedEmail = email.trim().toLowerCase()
  const user = getUsers().find(
    (storedUser) =>
      storedUser.email.toLowerCase() === normalisedEmail && storedUser.password === password,
  )

  if (!user) return null

  const { password: _password, ...currentUser } = user
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser))
  notifyAuthChanged()
  return currentUser
}

export function registerUser(username, email, password) {
  const users = getUsers()
  const normalisedEmail = email.trim().toLowerCase()

  if (users.some((user) => user.email.toLowerCase() === normalisedEmail)) {
    return { success: false, error: 'An account with this email already exists.' }
  }

  const nextId = users.reduce((highestId, user) => Math.max(highestId, user.id), 0) + 1
  const newUser = {
    id: nextId,
    username: username.trim(),
    email: normalisedEmail,
    password,
    role: 'user',
  }

  users.push(newUser)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  return { success: true }
}

export function getCurrentUser() {
  try {
    const storedCurrentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY))
    if (!storedCurrentUser) return null

    const matchingUser = getUsers().find(
      (user) => user.email.toLowerCase() === storedCurrentUser.email?.toLowerCase(),
    )

    if (!matchingUser) {
      localStorage.removeItem(CURRENT_USER_KEY)
      return null
    }

    const { password: _password, ...currentUser } = matchingUser
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser))
    return currentUser
  } catch {
    localStorage.removeItem(CURRENT_USER_KEY)
    return null
  }
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY)
  notifyAuthChanged()
}

export function isAuthenticated() {
  return Boolean(getCurrentUser())
}
