```markdown
# AI Voice Bot Project

Welcome to the **AI Voice Bot Project**, a voice-based application available at [voice.workhub.ai/test-call](https://voice.workhub.ai/test-call). This project integrates several technologies to provide a seamless user experience for voice calls, authentication, and data management.

> **Note:** This project was created as a quick hack, so there is a lot of room for improvements. If you need help to set it up or modify it for your own needs, let me know - always happy to help :)

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Overview

The AI Voice Bot Project is a web application that allows users to make voice calls, authenticate themselves, and interact with a voice bot. It leverages cutting-edge technology for a smooth and efficient user experience.

## Technology Stack

The project uses the following technologies:

### Frontend

- **React**: A JavaScript library for building user interfaces. React is used to create a responsive and interactive front-end experience.

### Backend

- **Python FASTAPI**: A modern, fast (high-performance), web framework for building APIs with Python 3.6+ based on standard Python type hints. The backend handles API requests and integrates with the database and other services.

### Database

- **Redis JSON DB**: An in-memory data structure store, used as a high-performance database, cache, and message broker. This project utilizes **Redis JSON DB**, which allows for efficient and scalable data management. It's highly performant and is a personal favorite for its speed and flexibility.

### Authentication

- **Twilio**: Twilio is used for handling authentication, including two-factor authentication (2FA) and SMS-based verifications.

### Voice Calls

- **Bland**: Bland is used for handling voice calls and integrations for voice-based interactions.

## Features

- **Voice Call Integration**: Make and receive voice calls directly from the web interface.
- **Real-time Authentication**: Secure authentication using Twilio's SMS-based verification and two-factor authentication.
- **Responsive Frontend**: Built with React for a smooth user experience.
- **High-performance Backend**: Powered by Python FASTAPI for quick API responses.
- **Efficient Data Management**: Uses Redis JSON DB for fast data retrieval and storage.

## Getting Started

To get started with the AI Voice Bot Project, follow the steps below:

### Installation

Clone the repository:

```bash
git clone https://github.com/alinaqi/AIVoiceBot.git
cd your-repo
```

### Backend Setup

1. **Install Python Dependencies**:

   Make sure you have Python 3.6+ installed. Install the required dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. **Run the FASTAPI Backend**:

   Start the backend server:

   ```bash
   uvicorn main:app --reload
   ```

   The backend will be running at `http://localhost:8000` or whatever port you assign. 

### Frontend Setup

1. **Install Node.js and NPM**:

   Ensure you have Node.js and npm (Node Package Manager) installed on your machine.

2. **Install Frontend Dependencies**:

   Navigate to the frontend directory and install dependencies:

   ```bash
   cd frontend
   npm install
   ```

3. **Run the React Frontend**:

   Start the React development server:

   ```bash
   npm start
   ```

   The frontend will be running at `http://localhost:x000` or whatver port you assign

## Usage

- Access the application at [voice.workhub.ai/test-call](https://voice.workhub.ai/test-call).
- Follow the on-screen instructions to make voice calls and authenticate yourself using Twilio.
- The backend API endpoints can be tested using any API client such as Postman or Curl.

## Contributing

We welcome contributions! Since this project was a quick hack, there is a lot of room for improvement. Please fork the repository and create a pull request for any features, bug fixes, or improvements.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. 

## Contact

If you have any questions or feedback, please feel free to reach out to me - the maintainer :)
```
