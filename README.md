# Restaurant Listing Platform

This web application provides a platform for users to explore various restaurants, view their details, leave reviews, and interact with businesses. It includes features such as user authentication, CRUD operations for business listings and reviews, and role-based access control.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Authentication](#authentication)
- [Role-Based Access Control](#role-based-access-control)
- [Todo](#Todo)


  ## Features

- **User Authentication:** Secure JWT authentication with role-based access control for Business Owners, Users, and Admins.
- **Listing Management:** CRUD operations for business listings, allowing owners to add and update their restaurant details.
- **Review System:** Users can leave reviews, and business owners can respond to these reviews.
- **Error Handling:** Comprehensive error messages and consistent error handling across the application.
- **Documentation:** Well-documented API endpoints and postman collection with API's example.

## Getting Started

### Prerequisites

- Node.js installed
- PostgreSQL database

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/DEEPAKK-T/Restaurant-Listing.git
   cd Restaurant-Listing
   create .env file in root directory

2. Install dependencies

    npm install

3. Set up your PostgreSQL database and update the configuration in src/utils/database.js. Create database by name 'restaurant' till we integrate the migrate code.

4. Run the application

    npm start

## Usage

- Access the API endpoints using a tool like Postman.
- Register users, create business listings, leave reviews, and interact with the features based on your role.

## Authentication

- The application uses JWT (JSON Web Tokens) for user authentication. Users obtain a token upon successful login, which is required for accessing protected routes.

## Role-Based Access Control

- **Business Listing API's** 

| Role           | Create | Read | Update | Delete |
| -------------- | ------ | ---- | ------ | ------ |
| Business Owner | Yes    | Yes  | Yes    | No     |
| User           | No     | Yes  | No     | No     |
| Admin          | Yes    | Yes  | Yes    | Yes    |

- **Review System routes**

| Role           | Create | Read | Update | Delete |
| -------------- | ------ | ---- | ------ | ------ |
| Business Owner | No     | Yes  | Yes    | No     |
| User           | Yes    | Yes  | Yes    | Yes    |
| Admin          | Yes    | Yes  | Yes    | Yes    |

## Todo
- Read secret from .env