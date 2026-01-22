FROM ghcr.io/engineer-man/piston

USER root

# Download packages from host at build time using ADD
ADD https://github.com/engineer-man/piston/releases/download/pkgs/node-15.10.0.pkg.tar.gz /tmp/node.tar.gz
ADD https://github.com/engineer-man/piston/releases/download/pkgs/python-3.9.4.pkg.tar.gz /tmp/python.tar.gz
ADD https://github.com/engineer-man/piston/releases/download/pkgs/typescript-4.2.3.pkg.tar.gz /tmp/typescript.tar.gz

# Extract packages
RUN mkdir -p /piston/packages/node/15.10.0 && \
    cd /piston/packages/node/15.10.0 && \
    tar xzf /tmp/node.tar.gz && \
    chmod +x run bin/* && \
    rm /tmp/node.tar.gz

RUN mkdir -p /piston/packages/python/3.9.4 && \
    cd /piston/packages/python/3.9.4 && \
    tar xzf /tmp/python.tar.gz && \
    chmod +x run bin/* && \
    rm /tmp/python.tar.gz

RUN mkdir -p /piston/packages/typescript/4.2.3 && \
    cd /piston/packages/typescript/4.2.3 && \
    tar xzf /tmp/typescript.tar.gz && \
    chmod +x run bin/* && \
    rm /tmp/typescript.tar.gz

# Create .ppman-installed marker files (required for Piston to detect packages)
RUN touch /piston/packages/node/15.10.0/.ppman-installed && \
    touch /piston/packages/python/3.9.4/.ppman-installed && \
    touch /piston/packages/typescript/4.2.3/.ppman-installed

# Create .env files with correct PATH format (no export keyword)
RUN echo "PATH=/piston/packages/node/15.10.0/bin" > /piston/packages/node/15.10.0/.env && \
    echo "PATH=/piston/packages/python/3.9.4/bin" > /piston/packages/python/3.9.4/.env && \
    echo "PATH=/piston/packages/node/15.10.0/bin:/piston/packages/typescript/4.2.3/bin" > /piston/packages/typescript/4.2.3/.env

# Fix TypeScript compile script (remove rename dependency, add ES2015+ and console support)
RUN echo '#!/usr/bin/env bash\ntsc --target es2015 --lib es2015,dom --outDir . "$@"' > /piston/packages/typescript/4.2.3/compile && \
    chmod +x /piston/packages/typescript/4.2.3/compile

# Fix TypeScript run script (correct filename handling)
RUN echo '#!/usr/bin/env bash\nCODE="${1%.ts}.js"\nshift\nnode "$CODE" "$@"' > /piston/packages/typescript/4.2.3/run && \
    chmod +x /piston/packages/typescript/4.2.3/run

# Fix ownership
RUN chown -R piston:piston /piston/packages

# Stay as root for isolate to work
# USER piston
