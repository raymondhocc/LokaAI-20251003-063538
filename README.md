# LokaAI: AI Translator with Brand Terms

LokaAI is a sophisticated, AI-powered localization platform designed for e-commerce. It automates the translation of product descriptions from English into multiple regional languages while ensuring brand consistency. The application features a 'Brand Terms' glossary to enforce correct terminology, a human-in-the-loop editing interface for quality assurance, and an analytics dashboard to track localization performance. By learning from user corrections over time, LokaAI continuously improves translation accuracy, helping businesses accelerate their global market entry with culturally relevant and on-brand content.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/raymondhocc/LokaAI-20251003-063538)

## ✨ Key Features

- **AI-Powered Translation**: Translate content into multiple languages simultaneously with a single click.
- **Brand Terms Glossary**: Maintain brand consistency by defining and enforcing specific terminology across all translations.
- **Human-in-the-Loop Review**: A side-by-side interface for editors to review, edit, and approve AI-generated translations, ensuring the highest quality.
- **History & Analytics**: Track translation volume, edit rates, and turnaround times with a visual dashboard.
- **Modern UI/UX**: A clean, minimalist, and responsive interface with both light and dark modes for a delightful user experience.
- **Configurable Settings**: Customize default target languages and manage application preferences.

## 🚀 Technology Stack

- **Frontend**:
  - [React](https://react.dev/)
  - [Vite](https://vitejs.dev/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [shadcn/ui](https://ui.shadcn.com/)
  - [Framer Motion](https://www.framer.com/motion/)
  - [Zustand](https://zustand-demo.pmnd.rs/)
  - [Recharts](https://recharts.org/)
- **Backend**:
  - [Cloudflare Workers](https://workers.cloudflare.com/)
  - [Hono](https://hono.dev/)
  - [Durable Objects](https://developers.cloudflare.com/durable-objects/)
- **Core**:
  - [TypeScript](https://www.typescriptlang.org/)
  - [Zod](https://zod.dev/)

## 🏁 Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Bun](https://bun.sh/)
- [Git](https://git-scm.com/)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/lokaai_translator.git
    cd lokaai_translator
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

### Environment Variables

To run the application locally, you need to set up your environment variables.

1.  Create a `.dev.vars` file in the root of the project:
    ```sh
    touch .dev.vars
    ```

2.  Add the following environment variables to the `.dev.vars` file. These are required for the AI translation features to work.

    ```ini
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"
    CF_AI_API_KEY="your-cloudflare-or-openai-api-key"
    ```

    > **Note on AI Functionality**: For security reasons, API keys cannot be managed directly within this development environment. To enable AI features, you must deploy the application to your own Cloudflare account and configure the environment variables in the dashboard settings.

## 💻 Development

To start the local development server, which includes both the Vite frontend and the Cloudflare Worker backend:

```sh
bun dev
```

The application will be available at `http://localhost:3000`. The frontend will automatically reload when you make changes to the source files.

## 🚀 Deployment

This project is designed for seamless deployment to Cloudflare's global network.

1.  **Login to Cloudflare:**
    If you haven't already, log in to your Cloudflare account via the command line:
    ```sh
    bun wrangler login
    ```

2.  **Deploy the application:**
    Run the deployment script, which will build the application and deploy it to your Cloudflare account:
    ```sh
    bun run deploy
    ```

3.  **Configure Environment Variables in Cloudflare:**
    After deployment, navigate to your Worker in the Cloudflare dashboard. Go to **Settings** > **Variables** and add your `CF_AI_BASE_URL` and `CF_AI_API_KEY` as secret variables to enable AI functionality in the deployed application.

Alternatively, you can deploy directly from your GitHub repository using the button below.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/raymondhocc/LokaAI-20251003-063538)

## 📂 Project Structure

The codebase is organized into two main parts: the frontend application and the backend worker.

-   `src/`: Contains the React frontend application.
    -   `components/`: Reusable UI components, including the main layout and shadcn/ui elements.
    -   `pages/`: View components for each main page of the application (Translator, Brand Terms, etc.).
    -   `lib/`: Shared utilities, constants, and state management (Zustand).
    -   `hooks/`: Custom React hooks.
-   `worker/`: Contains the Cloudflare Worker backend code.
    -   `index.ts`: The entry point for the worker.
    -   `userRoutes.ts`: Defines the API routes for the application.
    -   `agent.ts`: The core `ChatAgent` Durable Object for handling translation logic.
    -   `app-controller.ts`: The `AppController` Durable Object for managing global state like brand terms and history.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.