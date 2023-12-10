const express = require('express');
const { performance } = require('perf_hooks');
 const path=require('path')
const app = express();
const port = 8000;
 

 const sortSequential = (arrays) => {
  // if (!Array.isArray(arrays)) {
  //   throw new Error('Input is not an array.');
  // }

  return arrays.to_sort.map((arr) => arr.sort((a, b) => a - b));
};

const sortConcurrent = async (data) => {
  if (!Array.isArray(data.to_sort)) {
    throw new Error('Input data is not an array.');
  }

  const sortPromises = data.to_sort.map((arr) => new Promise((resolve) => {
    process.nextTick(() => {
      resolve(arr.sort((a, b) => a - b));
    });
  }));

  return Promise.all(sortPromises);
};

app.use(express.json());

app.post('/process-single', (req, res) => {
  try {
    const start = performance.now();
    const sortedArrays = sortSequential(req.body.to_sort);
    const end = performance.now();

    res.status(200).json({
      sorted_arrays: sortedArrays,
      time_ns: `${(end - start) * 1e6} nanoseconds`,
    });
  } catch (e) {
    res.status(500).json({
      status: false,
      message: e.message,
    });
  }
});

app.post('/process-concurrent', async (req, res) => {
  try {
    const start = performance.now();
    const sortedArrays = await sortConcurrent(req.body.to_sort);
    const end = performance.now();

    res.status(200).json({
      sorted_arrays: sortedArrays,
      time_ns: `${(end - start) * 1e6} nanoseconds`,
    });
  } catch (e) {
    res.status(500).json({
      status: false,
      message: e.message,
    });
  }
});
app.get('/',async (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
