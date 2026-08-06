FROM python:3.12-slim
RUN useradd --create-home --uid 10001 linkforge
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir .
USER linkforge
EXPOSE 8790
CMD ["linkforge-mcp","--transport","streamable-http","--host","0.0.0.0","--port","8790"]
