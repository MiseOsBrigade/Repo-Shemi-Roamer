FROM python:3.12-slim AS runtime
RUN useradd --create-home --uid 10001 linkforge
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir . "linkforge-core[all]>=1,<2"
USER linkforge
EXPOSE 8787
CMD ["uvicorn","linkforge_api.app:app","--host","0.0.0.0","--port","8787","--proxy-headers"]
