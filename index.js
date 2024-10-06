const express = require('express')
const pg = require('pg')
const app = express()
const port = 3000
const client = new pg.Client('postgres://localhost:5432/postgres')

