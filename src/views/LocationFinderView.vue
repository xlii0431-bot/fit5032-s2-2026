<template>
  <section class="page-section">
    <div class="container">
      <div class="row">
        <div class="col-12 col-lg-8 col-xl-7">
          <h1>Find a Recycling Location</h1>
          <p class="lead">Enter your details to prepare a search for a suitable local facility.</p>

          <form class="card border-0 shadow-sm mt-4" @submit.prevent>
            <div class="card-body p-4">
              <div class="mb-3">
                <label class="form-label" for="suburb">Suburb</label>
                <input id="suburb" class="form-control" type="text" placeholder="e.g. Clayton" />
              </div>
              <div class="mb-3">
                <label class="form-label" for="postcode">Postcode</label>
                <input
                  id="postcode"
                  class="form-control"
                  type="text"
                  inputmode="numeric"
                  placeholder="e.g. 3168"
                />
              </div>
              <div class="mb-3">
                <label class="form-label" for="recycling-item">Recycling item</label>
                <input
                  id="recycling-item"
                  class="form-control"
                  type="text"
                  placeholder="e.g. Batteries"
                />
              </div>
              <button class="btn btn-success" type="submit" disabled>Search coming soon</button>
              <p class="form-text mb-0 mt-2">Validation and location results will be added later.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>
