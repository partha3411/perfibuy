import { connect } from 'react-redux';
import { Row, Col } from 'reactstrap';
import actions from '../../actions';
import banners from './banners.json';
import CarouselSlider from '../../components/Common/CarouselSlider';
import { responsiveOneItemCarousel } from '../../components/Common/CarouselSlider/utils';
import React from 'react';

class Homepage extends React.PureComponent {
  render() {
    return (
        <div className='homepage'>
          {/* Full-width carousel */}
          <div className='home-carousel mb-4'>
            <CarouselSlider
                swipeable={true}
                showDots={true}
                infinite={true}
                autoPlay={false}
                slides={banners}
                responsive={responsiveOneItemCarousel}
            >
              {banners.map((item, index) => (
                  <img key={index} src={item.imageUrl} className='w-100' />
              ))}
            </CarouselSlider>
          </div>

          {/* 3-column image row below the slider */}
          {/*<Row className='px-3'>*/}
          {/*  <Col xs='12' md='4' className='mb-3'>*/}
          {/*    <div className='d-flex flex-column h-100 justify-content-between'>*/}
          {/*      <img src='/images/banners/banner-2.jpg' className='mb-3 img-fluid' />*/}
          {/*      <img src='/images/banners/banner-5.jpg' className='img-fluid' />*/}
          {/*    </div>*/}
          {/*  </Col>*/}
          {/*  <Col xs='12' md='4' className='mb-3 d-flex align-items-center justify-content-center'>*/}
          {/*    <img src='/images/banners/banner-2.jpg' className='img-fluid' />*/}
          {/*  </Col>*/}
          {/*  <Col xs='12' md='4' className='mb-3 d-flex align-items-center justify-content-center'>*/}
          {/*    <img src='/images/banners/banner-6.jpg' className='img-fluid' />*/}
          {/*  </Col>*/}
          {/*</Row>*/}

          {/* ==== Top Brands Section ==== */}
          <div className='top-brands-section px-3 mb-5'>
            <div className='d-flex justify-content-between align-items-center mb-3'>
              <h5 className='mb-0'>Top Brands</h5>
              <a href='/brands' className='text-primary'>View All</a>
            </div>
            <Row className='gx-3'>
              {[1, 2, 3, 4, 5].map((id) => (
                  <Col xs='6' md='2' key={id} className='mb-3'>
                    <div className='text-center border rounded p-2 h-100'>
                      <img src={`/images/brands/brand-${id}.png`} className='img-fluid' alt={`brand-${id}`} />
                    </div>
                  </Col>
              ))}
            </Row>
          </div>

          {/* ==== Top Sales Section (2 rows of 5 products) ==== */}
          <div className='top-sales-section px-3 mb-5'>
            <div className='d-flex justify-content-between align-items-center mb-3'>
              <h5 className='mb-0'>Top Sales</h5>
              <a href='/sales' className='text-primary'>View All</a>
            </div>
            <Row className='gx-3'>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => (
                  <Col xs='6' md='2' key={id} className='mb-4'>
                    <div className='border p-3 text-center h-100'>
                      <img src={`/images/products/top-sale-${id}.jpg`} className='img-fluid mb-2' alt={`top-sale-${id}`} />
                      <h6 className='mb-1'>Product {id}</h6>
                      <p className='text-muted small mb-0'>$99.99</p>
                    </div>
                  </Col>
              ))}
            </Row>
          </div>

        </div>
    );
  }
}

const mapStateToProps = state => ({});

export default connect(mapStateToProps, actions)(Homepage);
