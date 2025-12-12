import React, { useState, useEffect } from 'react';
import HomeBanner from "../../component/HomeFeature/HomeBanner";
import MainFeature from "../../component/HomeFeature/MainFeature";
import ProductFeature from "../../component/HomeFeature/ProductFeature";
import NewProductFeature from "../../component/HomeFeature/NewProductFeature"
import HomeBlog from '../../component/HomeFeature/HomeBlog';
import { getAllBanner, getProductFeatureService, getProductNewService, getNewBlog, getProductRecommendService } from '../../services/userService';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
function HomePage(props) {
    const [dataProductFeature, setDataProductFeature] = useState([])
    const [dataNewProductFeature, setNewProductFeature] = useState([])
    const [dataNewBlog, setdataNewBlog] = useState([])
    const [dataBanner, setdataBanner] = useState([])
    const [dataProductRecommend, setdataProductRecommend] = useState([])
    let settings = {
        dots: false,
        Infinity: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplaySpeed: 2000,
        autoplay: true,
        cssEase: "linear"
    }

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        console.log('HomePage - userData:', userData);
        
        if (userData) {
            fetchProductRecommend(userData.id)
            fetchProductFeature(userData.id)
        } else {
            fetchProductFeature(null)
        }
        fetchBlogFeature()
        fetchDataBrand()
        fetchProductNew()

        window.scrollTo(0, 0);
    }, [])

    // Lắng nghe sự kiện cập nhật sản phẩm từ admin
    useEffect(() => {
        let lastRefreshTime = localStorage.getItem('refreshProducts');
        
        const checkForUpdates = () => {
            const currentRefreshTime = localStorage.getItem('refreshProducts');
            if (currentRefreshTime && currentRefreshTime !== lastRefreshTime) {
                lastRefreshTime = currentRefreshTime;
                const userData = JSON.parse(localStorage.getItem('userData'));
                if (userData) {
                    fetchProductRecommend(userData.id)
                    fetchProductFeature(userData.id)
                } else {
                    fetchProductFeature(null)
                }
                fetchProductNew()
            }
        }
        
        // Kiểm tra mỗi 500ms để phản hồi nhanh hơn
        const interval = setInterval(checkForUpdates, 500);
        
        // Lắng nghe storage event cho cross-tab
        window.addEventListener('storage', checkForUpdates);
        
        // Lắng nghe custom event cho same-tab
        const handleRefreshProducts = () => {
            lastRefreshTime = null; // Force update
            checkForUpdates();
        }
        window.addEventListener('refreshProducts', handleRefreshProducts);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', checkForUpdates);
            window.removeEventListener('refreshProducts', handleRefreshProducts);
        }
    }, [])
    let fetchBlogFeature = async () => {
        let res = await getNewBlog(3)
        if (res && res.errCode === 0) {
            setdataNewBlog(res.data)
        }
    }
    let fetchProductFeature = async (userId) => {
        let res = await getProductFeatureService({
            limit: 6,
            userId: userId
        })
        if (res && res.errCode === 0) {
            setDataProductFeature(res.data)
        }
    }
    let fetchProductRecommend = async (userId) => {
        let res = await getProductRecommendService({
            limit: 20,
            userId: userId
        })
        console.log('fetchProductRecommend response:', res);
        if (res && res.errCode === 0) {
            console.log('fetchProductRecommend data:', res.data);
            setdataProductRecommend(res.data)
        }
    }
    let fetchDataBrand = async () => {
        let res = await getAllBanner({
            limit: 6,
            offset: 0,
            keyword: ''
        })
        if (res && res.errCode === 0) {
            setdataBanner(res.data)
        }
    }
    let fetchProductNew = async () => {
        let res = await getProductNewService(8)
        if (res && res.errCode === 0) {
            setNewProductFeature(res.data)
        }
    }
    return (
        <div>
            <Slider {...settings}>
                {dataBanner && dataBanner.length > 0 &&
                    dataBanner.map((item, index) => {
                        return (
                            <HomeBanner image={item.image} name={item.name}></HomeBanner>
                        )
                    })
                }


            </Slider>


            <MainFeature></MainFeature>
            <NewProductFeature title="Sản phẩm mới" description="Những sản phẩm vừa ra mắt mới lạ cuốn hút người xem" data={dataNewProductFeature}></NewProductFeature>
            <HomeBlog data={dataNewBlog} />
        </div>
    );
}

export default HomePage;