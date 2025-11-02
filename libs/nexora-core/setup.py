from setuptools import setup, find_packages

setup(
    name='nexora-core',
    version='0.1.0',
    packages=find_packages(),
    install_requires=[
        'redis',
        'openai',
        'google-generativeai',
    ],
)
